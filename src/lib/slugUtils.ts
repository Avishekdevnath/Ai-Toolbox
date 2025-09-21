import { nanoid, customAlphabet } from 'nanoid';

/**
 * Generates a URL-friendly slug from a title
 * 
 * @param title The title to convert to a slug
 * @param maxLength Maximum length of the slug (default: 60)
 * @returns A URL-friendly slug
 */
export function generateSlugFromTitle(title: string, maxLength: number = 60): string {
  if (!title) return '';
  
  // Convert to lowercase and replace non-alphanumeric characters with hyphens
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Truncate if too long
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-+$/, '');
  }
  
  return slug;
}

/**
 * Creates a unique slug by appending a random string if needed
 * 
 * @param baseSlug The base slug to make unique
 * @param checkExists Function that checks if a slug already exists
 * @returns A unique slug
 */
export async function createUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  // Try the base slug first
  if (baseSlug && !(await checkExists(baseSlug))) {
    return baseSlug;
  }
  
  // If base slug exists or is empty, generate a new one with a random suffix
  let uniqueSlug: string;
  let exists = true;
  
  // Try up to 5 times with increasingly longer random strings
  for (let i = 0; i < 5 && exists; i++) {
    const randomSuffix = nanoid(4 + i);
    uniqueSlug = baseSlug ? `${baseSlug}-${randomSuffix}` : randomSuffix;
    exists = await checkExists(uniqueSlug);
  }
  
  // If we still don't have a unique slug, use a timestamp-based one as fallback
  if (exists) {
    uniqueSlug = `form-${Date.now()}-${nanoid(6)}`;
  }
  
  return uniqueSlug;
}

/**
 * Generates a random, URL-safe slug using a lowercase alphanumeric alphabet.
 */
const randomSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

export function generateRandomSlug(length: number = 10): string {
  return randomSlug(length);
}

/**
 * Creates a unique random slug by generating and checking for collisions.
 */
export async function createUniqueRandomSlug(
  checkExists: (slug: string) => Promise<boolean>,
  length: number = 10
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateRandomSlug(length);
    // eslint-disable-next-line no-await-in-loop
    const exists = await checkExists(candidate);
    if (!exists) return candidate;
  }
  // Fallback to a longer id if collisions persist
  for (let i = 0; i < 10; i++) {
    const candidate = generateRandomSlug(length + 4);
    // eslint-disable-next-line no-await-in-loop
    const exists = await checkExists(candidate);
    if (!exists) return candidate;
  }
  // Final fallback
  return nanoid(21).toLowerCase();
}
