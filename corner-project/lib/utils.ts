// lib/utils.ts

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by appending number if needed
 */
export async function generateUniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = generateSlug(text);
  let counter = 1;
  let finalSlug = slug;

  while (await checkExists(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, ""); // Remove non-digit characters
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined) return true; // Optional
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
