/** Matches the events.slug CHECK constraint: lowercase words joined by hyphens. */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 63;

export function isValidSlug(value: string | null | undefined): value is string {
  return (
    typeof value === "string" &&
    value.length >= MIN_LENGTH &&
    value.length <= MAX_LENGTH &&
    SLUG.test(value)
  );
}
