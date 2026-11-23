import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/lib/firebase-admin';
import { renameImages } from '@/lib/cloudinary-server';
import { publicIdFromUrl } from '@/lib/cloudinary-public-id';

// The Cloudinary and Firebase Admin SDKs both require the Node runtime.
export const runtime = 'nodejs';

const MAX_PAIRS_PER_REQUEST = 1000;

interface RenameRequestPair {
  fromUrl: string;
  toPublicId: string;
}

function isPair(value: unknown): value is RenameRequestPair {
  const pair = value as RenameRequestPair | null;
  return (
    !!pair &&
    typeof pair === 'object' &&
    typeof pair.fromUrl === 'string' &&
    typeof pair.toPublicId === 'string' &&
    pair.toPublicId.length > 0
  );
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers.get('authorization'));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Auth check failed:', error);
    return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
  }

  let pairs: unknown;
  try {
    ({ pairs } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(pairs) || !pairs.every(isPair)) {
    return NextResponse.json(
      { error: '`pairs` must be an array of { fromUrl, toPublicId }' },
      { status: 400 }
    );
  }

  if (pairs.length > MAX_PAIRS_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many images to move at once (max ${MAX_PAIRS_PER_REQUEST} per request)` },
      { status: 400 }
    );
  }

  // The caller filters out URLs it cannot parse, so anything unparseable here is
  // a malformed request rather than a foreign asset to skip over.
  const sourceUrls = new Map<string, string>();
  const renamePairs = [];

  for (const pair of pairs) {
    const from = publicIdFromUrl(pair.fromUrl);
    if (!from) {
      return NextResponse.json(
        { error: `Not a Cloudinary URL: ${pair.fromUrl}` },
        { status: 400 }
      );
    }

    sourceUrls.set(from, pair.fromUrl);
    renamePairs.push({ from, to: pair.toPublicId });
  }

  try {
    const { renamed, failed } = await renameImages(renamePairs);

    const body = {
      renamed: renamed.map(asset => ({
        fromUrl: sourceUrls.get(asset.from) ?? asset.from,
        url: asset.secureUrl,
      })),
      failed,
    };

    if (failed.length > 0) {
      return NextResponse.json(
        { ...body, error: `Failed to move ${failed.length} image(s) in Cloudinary` },
        { status: 500 }
      );
    }

    return NextResponse.json(body);
  } catch (error) {
    console.error('Cloudinary rename failed:', error);
    return NextResponse.json(
      { renamed: [], failed: renamePairs.map(pair => pair.from), error: 'Cloudinary rename failed' },
      { status: 500 }
    );
  }
}
