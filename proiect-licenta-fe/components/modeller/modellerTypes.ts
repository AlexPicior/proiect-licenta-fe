import PROPERTIES_TYPES from "./drawerPropertiesTypes";

export type TaskProperty = {
    label: string,
    type: PROPERTIES_TYPES,
    value: string | number | boolean | [],
    options?: []
};

export type Task = {
    type: string;
    label: string;
    properties: any;
};
  
export type TaskProps = {
    task: Task;
};