import type { Scenario } from '../../../shared/types/scenario';
export declare const SCENARIOS_KEY: readonly ["scenarios"];
export declare const scenarioKey: (id: string) => readonly ["scenarios", string];
export declare function useScenarioList(): import("@tanstack/react-query").UseQueryResult<import("../../../shared/types/scenario").ScenarioMeta[], Error>;
export declare function useScenario(id: string): import("@tanstack/react-query").UseQueryResult<Scenario, Error>;
export declare function useCreateScenario(): import("@tanstack/react-query").UseMutationResult<Scenario, Error, {
    name: string;
    description: string;
}, unknown>;
export declare function useSaveScenario(): import("@tanstack/react-query").UseMutationResult<Scenario, Error, Scenario, unknown>;
export declare function useDeleteScenario(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
export declare function useImportScenario(): import("@tanstack/react-query").UseMutationResult<Scenario, Error, Scenario, unknown>;
export declare function useDuplicateScenario(): import("@tanstack/react-query").UseMutationResult<Scenario, Error, string, unknown>;
