import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/lib/firebase-admin';
import { destroyImages } from '@/lib/cloudinary-server';
import { publicIdsFromUrls } from '@/lib/cloudinary-public-id';

// The Cloudinary and Firebase Admin SDKs both require the Node runtime.
export const runtime = 'nodejs';

const MAX_URLS_PER_REQUEST = 1000;

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

  let urls: unknown;
  try {
    ({ urls } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(urls) || urls.some(url => typeof url !== 'string')) {
    return NextResponse.json({ error: '`urls` must be an array of strings' }, { status: 400 });
  }

  if (urls.length > MAX_URLS_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many URLs (max ${MAX_URLS_PER_REQUEST} per request)` },
      { status: 400 }
    );
  }

  const publicIds = publicIdsFromUrls(urls as string[]);

  try {
    const { deleted, failed } = await destroyImages(publicIds);

    if (failed.length > 0) {
      return NextResponse.json(
        { deleted, failed, error: `Failed to delete ${failed.length} image(s) from Cloudinary` },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted, failed });
  } catch (error) {
    console.error('Cloudinary deletion failed:', error);
    return NextResponse.json(
      { deleted: [], failed: publicIds, error: 'Cloudinary deletion failed' },
      { status: 500 }
    );
  }
}
