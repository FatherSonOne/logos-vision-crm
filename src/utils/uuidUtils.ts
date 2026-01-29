/**
 * UUID Utility Functions
 *
 * Handles UUID sanitization for Supabase auth user IDs
 */

/**
 * Removes "auth-" prefix from Supabase auth user IDs
 * to get pure UUID format required by database
 *
 * @param userId - User ID that may have "auth-" prefix
 * @returns Pure UUID without prefix
 */
export function sanitizeUserId(userId: string): string {
  if (!userId) return userId;

  // Remove "auth-" prefix if present
  const sanitized = userId.startsWith('auth-')
    ? userId.slice(5)  // Remove first 5 characters
    : userId;

  // Validate UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(sanitized)) {
    console.warn(`Invalid UUID format after sanitization: ${sanitized} (original: ${userId})`);
  }

  return sanitized;
}
