import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createScenario,
  deleteScenario,
  duplicateScenario,
  fetchScenario,
  fetchScenarioList,
  importScenario,
  saveScenario,
} from './scenariosApi';
import type { Scenario } from '../../../shared/types/scenario';

export const SCENARIOS_KEY = ['scenarios'] as const;
export const scenarioKey = (id: string) => ['scenarios', id] as const;

export function useScenarioList() {
  return useQuery({ queryKey: SCENARIOS_KEY, queryFn: fetchScenarioList });
}

export function useScenario(id: string) {
  return useQuery({ queryKey: scenarioKey(id), queryFn: () => fetchScenario(id) });
}

export function useCreateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description: string }) =>
      createScenario(name, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCENARIOS_KEY }),
  });
}

export function useSaveScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scenario: Scenario) => saveScenario(scenario),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: SCENARIOS_KEY });
      qc.setQueryData(scenarioKey(saved.scenario.id), saved);
    },
  });
}

export function useDeleteScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScenario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCENARIOS_KEY }),
  });
}

export function useImportScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scenario: Scenario) => importScenario(scenario),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCENARIOS_KEY }),
  });
}

export function useDuplicateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateScenario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCENARIOS_KEY }),
  });
}
