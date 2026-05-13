/**
 * Normalizes deprecated step fields in parsed JSON before Zod parse / editor load.
 * - Drops legacy `initial` (replaced by scenario.initialStep).
 * - Renames legacy `editable` → `revisitable` when `revisitable` is absent.
 */
export declare function migrateScenarioStepLegacyFields(data: unknown): unknown;
