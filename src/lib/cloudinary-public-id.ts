/**
 * Cloudinary asset IDs are never persisted in Firestore — only `secure_url` is
 * stored (see `uploadToCloudinaryClient`). Deleting an asset therefore means
 * recovering its `public_id` from the URL it was saved under, which is the only
 * authoritative record of where the asset actually lives.
 */

const CLOUDINARY_HOST = 'res.cloudinary.com';
const UPLOAD_SEGMENT = '/upload/';

// e.g. `v1712345678`
const VERSION_SEGMENT = /^v\d+$/;
// e.g. `w_500,h_500,c_fill` — a comma-separated list of `key_value` pairs.
const TRANSFORMATION_SEGMENT = /^[a-z]{1,3}_[^/,]+(,[a-z]{1,3}_[^/,]+)+$/;

/**
 * Extracts the Cloudinary `public_id` from a delivery URL, or returns null when
 * the URL is empty, points elsewhere, or cannot be parsed. Callers skip nulls
 * rather than failing, so a hand-edited or foreign URL never blocks a delete.
 */
export function publicIdFromUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.hostname !== CLOUDINARY_HOST) {
    return null;
  }

  const uploadIndex = parsed.pathname.indexOf(UPLOAD_SEGMENT);
  if (uploadIndex === -1) {
    return null;
  }

  const segments = parsed.pathname
    .slice(uploadIndex + UPLOAD_SEGMENT.length)
    .split('/')
    .filter(Boolean);

  // Cloudinary orders the path as `[transformations/]v{version}/{public_id}`, so
  // the version segment marks exactly where the public_id starts. Anchoring on it
  // avoids mistaking a real folder name (`on_the_road`) for a transformation.
  // The folder path that follows is part of the public_id, so every remaining
  // slash is preserved.
  const versionIndex = segments.findIndex(segment => VERSION_SEGMENT.test(segment));
  if (versionIndex !== -1 && versionIndex < segments.length - 1) {
    segments.splice(0, versionIndex + 1);
  } else {
    // No version segment: only strip leading segments that unambiguously look
    // like transformations, and never the last segment.
    while (segments.length > 1 && TRANSFORMATION_SEGMENT.test(segments[0])) {
      segments.shift();
    }
  }

  if (segments.length === 0) {
    return null;
  }

  const path = segments.join('/');
  // Strip only the final file extension.
  const withoutExtension = path.replace(/\.[^./]+$/, '');

  if (!withoutExtension) {
    return null;
  }

  try {
    return decodeURIComponent(withoutExtension);
  } catch {
    return withoutExtension;
  }
}

/**
 * Maps a mixed list of stored URLs to public IDs, dropping anything unparseable
 * and de-duplicating (a cover and banner can share an ID after a same-day
 * re-upload).
 */
export function publicIdsFromUrls(urls: (string | undefined | null)[]): string[] {
  const ids = new Set<string>();

  for (const url of urls) {
    const id = publicIdFromUrl(url);
    if (id) {
      ids.add(id);
    }
  }

  return [...ids];
}

// A chapter's pages live under `{Comic_Folder}/chap_{n}` with the number repeated
// in the filename (see the upload call sites in the admin chapter pages).
const CHAPTER_FOLDER_SEGMENT = /^chap_\d+$/;
const CHAPTER_FILENAME_TOKEN = /_chap\d+(?=_|$)/;

/**
 * The Cloudinary folder a comic's assets are uploaded under. Kept here so the
 * renumber/move flows derive the exact same name the upload pages do.
 */
export function comicFolderName(title: string): string {
  return title.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Rewrites a page's public ID for a new chapter number — the folder segment and
 * the `_chap{n}` token in the filename both carry the number, so both move.
 *
 * `comicFolder` re-homes the asset under a different comic (a cross-comic move);
 * omitted, the asset keeps whichever comic folder it was uploaded to, so a
 * renumber never relocates pages just because the comic title has been edited
 * since. An ID with no chapter folder to anchor on and no explicit `comicFolder`
 * is returned untouched rather than guessed at.
 */
export function chapterPublicId(
  publicId: string,
  { chapterNumber, comicFolder }: { chapterNumber: number; comicFolder?: string }
): string {
  if (!publicId) {
    return publicId;
  }

  const segments = publicId.split('/');
  const basename = segments.pop() as string;

  const hasChapterFolder =
    segments.length > 0 && CHAPTER_FOLDER_SEGMENT.test(segments[segments.length - 1]);
  if (hasChapterFolder) {
    segments.pop();
  }

  const folder = comicFolder ?? (hasChapterFolder ? segments.join('/') : null);
  if (folder === null) {
    return publicId;
  }

  const newBasename = basename.replace(CHAPTER_FILENAME_TOKEN, `_chap${chapterNumber}`);

  return [folder, `chap_${chapterNumber}`, newBasename].filter(Boolean).join('/');
}
