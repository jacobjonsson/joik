import { ChangeEvent, FocusEvent } from 'react';

export type FormValue = string | number | boolean;

export interface FormValues {
    [key: string]: FormValue;
}

export interface FormTouched {
    [key: string]: boolean;
}

export interface FormErrors {
    [key: string]: string;
}

export interface FormFields {
    [key: string]: FormValidator[];
}

export type FormValidator = (value: FormValue) => string;

export interface SubmitValue {
    [key: string]: FormValue;
}

export type FormSubmitHandler = (value: SubmitValue) => void;
export type FormChangeHandler = (event: ChangeEvent) => void;
export type FormBlurHandler = (event: FocusEvent) => void;
export type RegisterField = () => void;
export type UnregisterField = () => void;

export interface FormState {
    values: FormValues;
    touched: FormTouched;
    errors: FormErrors;
    fields: FormFields;
    isSubmitting: boolean;
    isValidating: boolean;
    submitSucceeded: boolean;
}

export interface FormContext extends FormState {
    handleChange: FormChangeHandler;
    handleBlur: FormBlurHandler;
    handleSubmit: FormChangeHandler;
    registerField
};
