/**
 * Converts a human-readable label into a URL/id-safe slug.
 * Example: "Высокий приоритет" → "vysokiy_prioritet"
 * Only keeps a-z, 0-9, and underscores.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[а-яё]/g, char => cyrillicMap[char] ?? '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

const cyrillicMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};
