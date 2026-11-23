import { chapterPublicId, publicIdFromUrl } from '@/lib/cloudinary-public-id';
import { callCloudinaryApi } from '@/services/cloudinary-api';

export interface ChapterImageMove {
  urls: string[];
  chapterNumber: number;
  /** Set only for a cross-comic move; otherwise the existing comic folder is kept. */
  comicFolder?: string;
}

export interface ChapterImageMoveResult {
  /** Old URL -> new URL, for every page that actually moved. */
  urlMap: Map<string, string>;
  /** Puts the assets back where they were; safe to call when nothing moved. */
  rollback: () => Promise<void>;
}

interface RenamePayloadPair {
  fromUrl: string;
  toPublicId: string;
}

async function postRenames(
  pairs: RenamePayloadPair[]
): Promise<{ fromUrl: string; url: string }[]> {
  const payload = await callCloudinaryApi<{
    renamed?: { fromUrl: string; url: string }[];
    failed?: string[];
  }>('/api/cloudinary/rename', { pairs }, 'Image move failed');

  if (payload.failed && payload.failed.length > 0) {
    throw new Error(`Failed to move ${payload.failed.length} image(s) in Cloudinary`);
  }

  return payload.renamed ?? [];
}

/**
 * Moves chapter pages into the Cloudinary folder for their new chapter number,
 * via the admin-only API route (renaming needs a signed call).
 *
 * Throws if any page could not be moved — the route rolls its own renames back
 * first — so callers abort before writing new numbers to Firestore. The returned
 * `rollback` covers the other half of that ordering: if the Firestore write then
 * fails, it puts the assets back rather than leaving stored URLs pointing at IDs
 * that no longer exist.
 */
export async function moveChapterImages(
  moves: ChapterImageMove[]
): Promise<ChapterImageMoveResult> {
  const pairs: RenamePayloadPair[] = [];
  const originalPublicIds = new Map<string, string>();

  for (const move of moves) {
    for (const url of move.urls) {
      const from = publicIdFromUrl(url);
      if (!from) {
        continue;
      }

      const to = chapterPublicId(from, {
        chapterNumber: move.chapterNumber,
        comicFolder: move.comicFolder,
      });

      if (to === from) {
        continue;
      }

      pairs.push({ fromUrl: url, toPublicId: to });
      originalPublicIds.set(url, from);
    }
  }

  if (pairs.length === 0) {
    return { urlMap: new Map(), rollback: async () => {} };
  }

  const renamed = await postRenames(pairs);

  const urlMap = new Map(renamed.map(asset => [asset.fromUrl, asset.url]));

  const rollback = async () => {
    const inverse = renamed
      .map(asset => ({
        fromUrl: asset.url,
        toPublicId: originalPublicIds.get(asset.fromUrl),
      }))
      .filter((pair): pair is RenamePayloadPair => !!pair.toPublicId);

    if (inverse.length === 0) {
      return;
    }

    try {
      await postRenames(inverse);
    } catch (error) {
      // The caller is already throwing; a failed rollback must not mask why.
      console.error('Failed to roll back Cloudinary image move:', error);
    }
  };

  return { urlMap, rollback };
}
