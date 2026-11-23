import { v2 as cloudinary } from 'cloudinary';

// Admin API hard limit for a single delete_resources call.
const DELETE_BATCH_SIZE = 100;

export interface DestroyResult {
  deleted: string[];
  failed: string[];
}

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  const missing = [
    !cloud_name && 'CLOUDINARY_CLOUD_NAME',
    !api_key && 'CLOUDINARY_API_KEY',
    !api_secret && 'CLOUDINARY_API_SECRET',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Cloudinary server credentials missing: ${missing.join(', ')}`);
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

/**
 * Permanently deletes uploaded images by public ID.
 *
 * An asset that is already gone reports `not_found`, which counts as success:
 * deletion has to be idempotent so a retry after a partial failure can finish
 * the job instead of blocking forever on a missing asset.
 */
export async function destroyImages(publicIds: string[]): Promise<DestroyResult> {
  const deleted: string[] = [];
  const failed: string[] = [];

  if (publicIds.length === 0) {
    return { deleted, failed };
  }

  configureCloudinary();

  for (let i = 0; i < publicIds.length; i += DELETE_BATCH_SIZE) {
    const batch = publicIds.slice(i, i + DELETE_BATCH_SIZE);

    try {
      const response = await cloudinary.api.delete_resources(batch, {
        resource_type: 'image',
        type: 'upload',
        invalidate: true,
      });

      const outcomes: Record<string, string> = response?.deleted ?? {};

      for (const id of batch) {
        const outcome = outcomes[id];
        if (outcome === 'deleted' || outcome === 'not_found') {
          deleted.push(id);
        } else {
          failed.push(id);
        }
      }
    } catch (error) {
      console.error('Cloudinary delete_resources failed:', error);
      failed.push(...batch);
    }
  }

  return { deleted, failed };
}

export interface RenamePair {
  from: string;
  to: string;
}

export interface RenamedAsset {
  from: string;
  to: string;
  secureUrl: string;
  // What the Media Library showed before the move, so a rollback can restore it.
  // Both are undefined on a fixed-folder-mode product environment.
  previousAssetFolder?: string;
  previousDisplayName?: string;
}

export interface RenameResult {
  renamed: RenamedAsset[];
  failed: string[];
}

// Renames go one asset at a time (there is no bulk rename API), so pages inside a
// single chapter are moved in parallel to keep a renumber tolerable.
const RENAME_CONCURRENCY = 8;

function httpCode(error: unknown): number | undefined {
  const candidate = error as { http_code?: number; error?: { http_code?: number } } | null;
  return candidate?.http_code ?? candidate?.error?.http_code;
}

function chapterNumberOf(publicId: string): number {
  const match = /\/chap_(\d+)\//.exec(`/${publicId}`);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function folderOf(publicId: string): string {
  const cut = publicId.lastIndexOf('/');
  return cut === -1 ? '' : publicId.slice(0, cut);
}

function displayNameOf(publicId: string): string {
  return publicId.slice(publicId.lastIndexOf('/') + 1);
}

interface RenameResponse {
  secure_url: string;
  // Only returned on a product environment in dynamic folder mode.
  asset_folder?: string;
  display_name?: string;
}

async function renameOrAdopt(from: string, to: string): Promise<RenameResponse> {
  try {
    return await cloudinary.uploader.rename(from, to, {
      resource_type: 'image',
      // Never clobber: if two pages resolve to the same target the rename has to
      // fail loudly instead of destroying one of them.
      overwrite: false,
      invalidate: true,
    });
  } catch (error) {
    // A missing source can mean the rename already happened — a retry after a
    // partially applied run. If the target is there, the move is done.
    if (httpCode(error) === 404) {
      const existing = await cloudinary.api
        .resource(to, { resource_type: 'image', type: 'upload' })
        .catch(() => null);

      if (existing?.secure_url) {
        return existing;
      }
    }

    throw error;
  }
}

async function renameOne({ from, to }: RenamePair): Promise<RenamedAsset> {
  const asset = await renameOrAdopt(from, to);
  const targetFolder = folderOf(to);

  // In dynamic folder mode the Media Library folder is metadata, decoupled from
  // the public ID: renaming moves the delivery URL but leaves the asset filed
  // under the old chapter folder. `asset_folder` comes back only in that mode,
  // so its presence is what tells the two apart.
  if (typeof asset.asset_folder !== 'string' || asset.asset_folder === targetFolder) {
    return { from, to, secureUrl: asset.secure_url };
  }

  // The display name is what the dashboard actually labels the asset with. Move
  // it along only when it is still the one Cloudinary derived from the old public
  // ID — a name someone typed in the Media Library is theirs to keep.
  const retitle = asset.display_name === displayNameOf(from);

  try {
    await cloudinary.api.update(to, {
      resource_type: 'image',
      type: 'upload',
      asset_folder: targetFolder,
      ...(retitle ? { display_name: displayNameOf(to) } : {}),
    });
  } catch (error) {
    // Undo this pair's own rename so it is not left half-moved: the caller only
    // rolls back the assets it was told were renamed.
    await cloudinary.uploader
      .rename(to, from, { resource_type: 'image', overwrite: false, invalidate: true })
      .catch(undoError => console.error(`Failed to undo rename ${to} -> ${from}:`, undoError));

    throw error;
  }

  return {
    from,
    to,
    secureUrl: asset.secure_url,
    previousAssetFolder: asset.asset_folder,
    previousDisplayName: retitle ? asset.display_name : undefined,
  };
}

/**
 * Moves uploaded images to new public IDs, all or nothing.
 *
 * Any failure rolls the already-renamed assets back to their original IDs and
 * reports the failure, so a caller that has not yet written the new URLs to
 * Firestore is left with Cloudinary exactly as it found it.
 */
export async function renameImages(pairs: RenamePair[]): Promise<RenameResult> {
  const work = pairs.filter(pair => pair.from !== pair.to);

  if (work.length === 0) {
    return { renamed: [], failed: [] };
  }

  configureCloudinary();

  // Chapters are renumbered downwards, so moving the lowest target first frees
  // `chap_3` before the chapter behind it needs that name.
  const ordered = [...work].sort((a, b) => chapterNumberOf(a.to) - chapterNumberOf(b.to));

  const renamed: RenamedAsset[] = [];
  const failed: string[] = [];

  for (let i = 0; i < ordered.length && failed.length === 0; i += RENAME_CONCURRENCY) {
    const batch = ordered.slice(i, i + RENAME_CONCURRENCY);

    const results = await Promise.allSettled(batch.map(renameOne));

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        renamed.push(result.value);
      } else {
        console.error('Cloudinary rename failed:', result.reason);
        failed.push(batch[index].from);
      }
    });
  }

  if (failed.length > 0) {
    await rollbackRenames(renamed);
    return { renamed: [], failed };
  }

  return { renamed, failed };
}

async function rollbackRenames(renamed: RenamedAsset[]): Promise<void> {
  for (const asset of renamed) {
    try {
      await cloudinary.uploader.rename(asset.to, asset.from, {
        resource_type: 'image',
        overwrite: false,
        invalidate: true,
      });

      if (typeof asset.previousAssetFolder === 'string') {
        await cloudinary.api.update(asset.from, {
          resource_type: 'image',
          type: 'upload',
          asset_folder: asset.previousAssetFolder,
          ...(asset.previousDisplayName ? { display_name: asset.previousDisplayName } : {}),
        });
      }
    } catch (error) {
      // Nothing to do but report it: the original failure is what the caller
      // needs to see, and Firestore still points at the pre-rename URLs.
      console.error(`Failed to roll back rename ${asset.to} -> ${asset.from}:`, error);
    }
  }
}
