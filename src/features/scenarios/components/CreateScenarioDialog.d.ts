type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string) => void;
};
export declare function CreateScenarioDialog({ open, loading, onClose, onSubmit }: Props): import("react/jsx-runtime").JSX.Element;
export {};
