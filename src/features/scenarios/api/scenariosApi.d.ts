import type { Scenario, ScenarioMeta } from '../../../shared/types/scenario';
export declare function fetchScenarioList(): Promise<ScenarioMeta[]>;
export declare function fetchScenario(id: string): Promise<Scenario>;
export declare function createScenario(name: string, description: string): Promise<Scenario>;
export declare function saveScenario(scenario: Scenario): Promise<Scenario>;
export declare function deleteScenario(id: string): Promise<void>;
export declare function importScenario(scenario: Scenario): Promise<Scenario>;
export declare function duplicateScenario(id: string): Promise<Scenario>;
