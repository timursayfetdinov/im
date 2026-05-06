/**
 * Converts a human-readable label into a URL/id-safe slug.
 * Example: "Высокий приоритет" → "vysokiy_prioritet"
 * Only keeps a-z, 0-9, and underscores.
 */
export declare function slugify(value: string): string;
