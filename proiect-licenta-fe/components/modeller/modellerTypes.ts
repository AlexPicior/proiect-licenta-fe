import PROPERTIES_TYPES from "./drawerPropertiesTypes";

export type TaskProperty = {
    label: string,
    type: PROPERTIES_TYPES,
    value: any,
    options?: [],
    optionsType?: string
};

export type Task = {
    type: string;
    label: string;
    properties: any;
};
  
export type TaskProps = {
    task: Task;
};