import { z } from 'zod';
export declare const stepSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    revisitable: z.ZodBoolean;
    multitasking: z.ZodBoolean;
    report: z.ZodBoolean;
    finish: z.ZodBoolean;
    transitions: z.ZodObject<{
        default: z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
            condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"Button">;
    view: z.ZodObject<{
        label: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    revisitable: z.ZodBoolean;
    multitasking: z.ZodBoolean;
    report: z.ZodBoolean;
    finish: z.ZodBoolean;
    transitions: z.ZodObject<{
        default: z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
            condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"Comment">;
    view: z.ZodObject<{
        label: z.ZodString;
        default: z.ZodString;
        required: z.ZodBoolean;
        readonly: z.ZodBoolean;
        minLength: z.ZodNumber;
        maxLength: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    revisitable: z.ZodBoolean;
    multitasking: z.ZodBoolean;
    report: z.ZodBoolean;
    finish: z.ZodBoolean;
    transitions: z.ZodObject<{
        default: z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
            condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"Datetime">;
    view: z.ZodObject<{
        label: z.ZodString;
        required: z.ZodBoolean;
        min: z.ZodNullable<z.ZodString>;
        max: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    revisitable: z.ZodBoolean;
    multitasking: z.ZodBoolean;
    report: z.ZodBoolean;
    finish: z.ZodBoolean;
    transitions: z.ZodObject<{
        default: z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
            condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"Image">;
    view: z.ZodObject<{
        label: z.ZodString;
        source: z.ZodEnum<{
            fixed: "fixed";
            map: "map";
            operator: "operator";
            camera: "camera";
        }>;
        image: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    revisitable: z.ZodBoolean;
    multitasking: z.ZodBoolean;
    report: z.ZodBoolean;
    finish: z.ZodBoolean;
    transitions: z.ZodObject<{
        default: z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
            condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"RadioButton">;
    view: z.ZodObject<{
        label: z.ZodString;
        required: z.ZodBoolean;
        default: z.ZodNullable<z.ZodString>;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    revisitable: z.ZodBoolean;
    multitasking: z.ZodBoolean;
    report: z.ZodBoolean;
    finish: z.ZodBoolean;
    transitions: z.ZodObject<{
        default: z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
            condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"Select">;
    view: z.ZodObject<{
        required: z.ZodBoolean;
        lists: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            options: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    revisitable: z.ZodBoolean;
    multitasking: z.ZodBoolean;
    report: z.ZodBoolean;
    finish: z.ZodBoolean;
    transitions: z.ZodObject<{
        default: z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            goto: z.ZodNullable<z.ZodString>;
            macro: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
            condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"Checkbox">;
    view: z.ZodObject<{
        label: z.ZodString;
        minSelected: z.ZodNumber;
        maxSelected: z.ZodNullable<z.ZodNumber>;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            default: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>], "type">;
export declare const scenarioSchema: z.ZodObject<{
    scenario: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        version: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        initialStep: z.ZodString;
    }, z.core.$strip>;
    steps: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        revisitable: z.ZodBoolean;
        multitasking: z.ZodBoolean;
        report: z.ZodBoolean;
        finish: z.ZodBoolean;
        transitions: z.ZodObject<{
            default: z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
                condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"Button">;
        view: z.ZodObject<{
            label: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        revisitable: z.ZodBoolean;
        multitasking: z.ZodBoolean;
        report: z.ZodBoolean;
        finish: z.ZodBoolean;
        transitions: z.ZodObject<{
            default: z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
                condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"Comment">;
        view: z.ZodObject<{
            label: z.ZodString;
            default: z.ZodString;
            required: z.ZodBoolean;
            readonly: z.ZodBoolean;
            minLength: z.ZodNumber;
            maxLength: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        revisitable: z.ZodBoolean;
        multitasking: z.ZodBoolean;
        report: z.ZodBoolean;
        finish: z.ZodBoolean;
        transitions: z.ZodObject<{
            default: z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
                condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"Datetime">;
        view: z.ZodObject<{
            label: z.ZodString;
            required: z.ZodBoolean;
            min: z.ZodNullable<z.ZodString>;
            max: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        revisitable: z.ZodBoolean;
        multitasking: z.ZodBoolean;
        report: z.ZodBoolean;
        finish: z.ZodBoolean;
        transitions: z.ZodObject<{
            default: z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
                condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"Image">;
        view: z.ZodObject<{
            label: z.ZodString;
            source: z.ZodEnum<{
                fixed: "fixed";
                map: "map";
                operator: "operator";
                camera: "camera";
            }>;
            image: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        revisitable: z.ZodBoolean;
        multitasking: z.ZodBoolean;
        report: z.ZodBoolean;
        finish: z.ZodBoolean;
        transitions: z.ZodObject<{
            default: z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
                condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"RadioButton">;
        view: z.ZodObject<{
            label: z.ZodString;
            required: z.ZodBoolean;
            default: z.ZodNullable<z.ZodString>;
            options: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        revisitable: z.ZodBoolean;
        multitasking: z.ZodBoolean;
        report: z.ZodBoolean;
        finish: z.ZodBoolean;
        transitions: z.ZodObject<{
            default: z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
                condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"Select">;
        view: z.ZodObject<{
            required: z.ZodBoolean;
            lists: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                options: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    label: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        revisitable: z.ZodBoolean;
        multitasking: z.ZodBoolean;
        report: z.ZodBoolean;
        finish: z.ZodBoolean;
        transitions: z.ZodObject<{
            default: z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
                goto: z.ZodNullable<z.ZodString>;
                macro: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, z.core.$strip>>;
                condition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"Checkbox">;
        view: z.ZodObject<{
            label: z.ZodString;
            minSelected: z.ZodNumber;
            maxSelected: z.ZodNullable<z.ZodNumber>;
            options: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                default: z.ZodBoolean;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>], "type">>;
}, z.core.$strip>;
export type ScenarioInput = z.input<typeof scenarioSchema>;
