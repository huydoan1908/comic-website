import { publicIdsFromUrls } from '@/lib/cloudinary-public-id';
import { callCloudinaryApi } from '@/services/cloudinary-api';

/**
 * Permanently removes the given images from Cloudinary via the admin-only API route.
 *
 * Throws if any image could not be deleted, so callers can abort before touching
 * Firestore — that ordering is what keeps assets from being orphaned.
 */
export async function deleteCloudinaryImages(
  urls: (string | undefined | null)[]
): Promise<void> {
  const deletableUrls = urls.filter(
    (url): url is string => typeof url === 'string' && publicIdsFromUrls([url]).length > 0
  );

  if (deletableUrls.length === 0) {
    return;
  }

  const payload = await callCloudinaryApi<{ failed?: string[] }>(
    '/api/cloudinary/delete',
    { urls: deletableUrls },
    'Image deletion failed'
  );

  if (payload.failed && payload.failed.length > 0) {
    throw new Error(`Failed to delete ${payload.failed.length} image(s) from Cloudinary`);
  }
}
