enum FORM_FIELD_TYPES {
    SINGLE_TEXT = "single_text",
    MULTI_TEXT = "multi_text",
    TEXT_AREA = "text_area",
    SINGLE_SELECT = "single_select",
    MULTI_SELECT = "multi_select",
    NUMBER = "number",
    BOOLEN = "boolean",
    DATE = "date",
    UPLOAD = "upload"
};
export default FORM_FIELD_TYPES;

export type FormField ={
    id?: string
    label: string
    type: FORM_FIELD_TYPES,
    options?: string[]
}

export type FormFieldMap = {
    [id: string]: FormField;
  };
  

export type Form = {
    label: string,
    pages: FormField[][]
};

export type Option = {
    label: string, 
    value: string
}