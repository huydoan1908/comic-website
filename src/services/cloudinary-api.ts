import { auth } from '@/lib/firebase';

/**
 * Calls one of the admin-only Cloudinary routes with the caller's Firebase ID
 * token. Signed Cloudinary operations cannot run in the browser, so every one of
 * them goes through `/api/cloudinary/*` and every one needs the same envelope.
 */
export async function callCloudinaryApi<T>(
  endpoint: string,
  body: unknown,
  failureMessage: string
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to manage images');
  }

  const token = await user.getIdToken();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  let payload = {} as T & { error?: string };
  try {
    payload = await response.json();
  } catch {
    // Fall through to the status-based message below.
  }

  if (!response.ok) {
    throw new Error(payload.error || `${failureMessage} (HTTP ${response.status})`);
  }

  return payload;
}
