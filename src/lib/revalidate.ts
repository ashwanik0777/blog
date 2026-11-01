import { revalidatePath } from 'next/cache';

/** Refreshes every cached public page (home, listings, posts, sitemap, feed) after content changes. */
export function revalidatePublicContent() {
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    console.warn('Revalidation failed:', error);
  }
}
