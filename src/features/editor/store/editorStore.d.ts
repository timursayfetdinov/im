import type { Scenario, Step, StepType, TransitionRule, TransitionTarget, ValidationError } from '../../../shared/types/scenario';
type DrawerTab = 0 | 1 | 2;
type EditorState = {
    scenario: Scenario | null;
    validationErrors: ValidationError[];
    isDirty: boolean;
    openStepId: string | null;
    drawerTab: DrawerTab;
};
type EditorActions = {
    loadScenario: (scenario: Scenario) => void;
    updateMeta: (patch: Partial<Scenario['scenario']>) => void;
    clearScenario: () => void;
    addStep: (type: StepType) => void;
    updateStep: (id: string, patch: Partial<Omit<Step, 'id' | 'type' | 'view' | 'transitions'>>) => void;
    updateStepView: (id: string, view: Step['view']) => void;
    removeStep: (id: string) => void;
    duplicateStep: (id: string) => void;
    reorderSteps: (fromIndex: number, toIndex: number) => void;
    updateDefault: (stepId: string, patch: Partial<TransitionTarget>) => void;
    addRule: (stepId: string) => void;
    updateRule: (stepId: string, ruleIndex: number, patch: Partial<TransitionRule>) => void;
    removeRule: (stepId: string, ruleIndex: number) => void;
    reorderRules: (stepId: string, fromIndex: number, toIndex: number) => void;
    openStep: (id: string, tab?: DrawerTab) => void;
    closeDrawer: () => void;
    setDrawerTab: (tab: DrawerTab) => void;
};
export declare const useEditorStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<EditorState & EditorActions>, "setState"> & {
    setState(nextStateOrUpdater: (EditorState & EditorActions) | Partial<EditorState & EditorActions> | ((state: {
        scenario: {
            scenario: {
                id: string;
                name: string;
                description: string;
                version: number;
                createdAt: string;
                updatedAt: string;
                initialStep: string;
            };
            steps: ({
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Button";
                view: {
                    label: string;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Comment";
                view: {
                    label: string;
                    default: string;
                    required: boolean;
                    readonly: boolean;
                    minLength: number;
                    maxLength: number;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Datetime";
                view: {
                    label: string;
                    required: boolean;
                    min: string | null;
                    max: string | null;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Image";
                view: {
                    label: string;
                    source: import("../../../shared/types/scenario").ImageSource;
                    image: string | null;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "RadioButton";
                view: {
                    label: string;
                    required: boolean;
                    default: string | null;
                    options: {
                        id: string;
                        label: string;
                    }[];
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Select";
                view: {
                    required: boolean;
                    lists: {
                        id: string;
                        label: string;
                        options: {
                            id: string;
                            label: string;
                        }[];
                    }[];
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Checkbox";
                view: {
                    label: string;
                    minSelected: number;
                    maxSelected: number | null;
                    options: {
                        id: string;
                        label: string;
                        default: boolean;
                    }[];
                };
            })[];
        } | null;
        validationErrors: {
            code: import("../../../shared/types/scenario").ValidationErrorCode;
            message: string;
            stepId?: string | undefined;
            field?: string | undefined;
            ruleIndex?: number | undefined;
        }[];
        isDirty: boolean;
        openStepId: string | null;
        drawerTab: DrawerTab;
        loadScenario: (scenario: Scenario) => void;
        updateMeta: (patch: Partial<Scenario["scenario"]>) => void;
        clearScenario: () => void;
        addStep: (type: StepType) => void;
        updateStep: (id: string, patch: Partial<Omit<Step, "id" | "type" | "view" | "transitions">>) => void;
        updateStepView: (id: string, view: Step["view"]) => void;
        removeStep: (id: string) => void;
        duplicateStep: (id: string) => void;
        reorderSteps: (fromIndex: number, toIndex: number) => void;
        updateDefault: (stepId: string, patch: Partial<TransitionTarget>) => void;
        addRule: (stepId: string) => void;
        updateRule: (stepId: string, ruleIndex: number, patch: Partial<TransitionRule>) => void;
        removeRule: (stepId: string, ruleIndex: number) => void;
        reorderRules: (stepId: string, fromIndex: number, toIndex: number) => void;
        openStep: (id: string, tab?: DrawerTab) => void;
        closeDrawer: () => void;
        setDrawerTab: (tab: DrawerTab) => void;
    }) => void), shouldReplace?: false): void;
    setState(nextStateOrUpdater: (EditorState & EditorActions) | ((state: {
        scenario: {
            scenario: {
                id: string;
                name: string;
                description: string;
                version: number;
                createdAt: string;
                updatedAt: string;
                initialStep: string;
            };
            steps: ({
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Button";
                view: {
                    label: string;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Comment";
                view: {
                    label: string;
                    default: string;
                    required: boolean;
                    readonly: boolean;
                    minLength: number;
                    maxLength: number;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Datetime";
                view: {
                    label: string;
                    required: boolean;
                    min: string | null;
                    max: string | null;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Image";
                view: {
                    label: string;
                    source: import("../../../shared/types/scenario").ImageSource;
                    image: string | null;
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "RadioButton";
                view: {
                    label: string;
                    required: boolean;
                    default: string | null;
                    options: {
                        id: string;
                        label: string;
                    }[];
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Select";
                view: {
                    required: boolean;
                    lists: {
                        id: string;
                        label: string;
                        options: {
                            id: string;
                            label: string;
                        }[];
                    }[];
                };
            } | {
                id: string;
                title: string;
                description: string;
                editable: boolean;
                multitasking: boolean;
                report: boolean;
                finish: boolean;
                transitions: {
                    default: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                    };
                    rules?: {
                        goto: string | null;
                        macro: {
                            name: string;
                            args: {
                                [x: string]: unknown;
                            };
                        } | null;
                        condition: {
                            [x: string]: unknown;
                        };
                    }[] | undefined;
                };
                type: "Checkbox";
                view: {
                    label: string;
                    minSelected: number;
                    maxSelected: number | null;
                    options: {
                        id: string;
                        label: string;
                        default: boolean;
                    }[];
                };
            })[];
        } | null;
        validationErrors: {
            code: import("../../../shared/types/scenario").ValidationErrorCode;
            message: string;
            stepId?: string | undefined;
            field?: string | undefined;
            ruleIndex?: number | undefined;
        }[];
        isDirty: boolean;
        openStepId: string | null;
        drawerTab: DrawerTab;
        loadScenario: (scenario: Scenario) => void;
        updateMeta: (patch: Partial<Scenario["scenario"]>) => void;
        clearScenario: () => void;
        addStep: (type: StepType) => void;
        updateStep: (id: string, patch: Partial<Omit<Step, "id" | "type" | "view" | "transitions">>) => void;
        updateStepView: (id: string, view: Step["view"]) => void;
        removeStep: (id: string) => void;
        duplicateStep: (id: string) => void;
        reorderSteps: (fromIndex: number, toIndex: number) => void;
        updateDefault: (stepId: string, patch: Partial<TransitionTarget>) => void;
        addRule: (stepId: string) => void;
        updateRule: (stepId: string, ruleIndex: number, patch: Partial<TransitionRule>) => void;
        removeRule: (stepId: string, ruleIndex: number) => void;
        reorderRules: (stepId: string, fromIndex: number, toIndex: number) => void;
        openStep: (id: string, tab?: DrawerTab) => void;
        closeDrawer: () => void;
        setDrawerTab: (tab: DrawerTab) => void;
    }) => void), shouldReplace: true): void;
}>;
export {};
