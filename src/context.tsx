import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { FormContext } from 'typings';

const initialValues = {
    values: {},
    touched: {},
    errors: {},
    handleChange: () => undefined,
    handleBlur: () => undefined,
    handleSubmit: () => undefined,
};

const formContext = createContext<FormContext>(initialValues);

interface Props {
    children: ReactNode;
    value: FormContext;
}

export function FormProvider(props: Props) {
    const contextValue = useMemo(() => props.value, [props.value]);
    return <formContext.Provider value={contextValue}>{props.children}</formContext.Provider>;
}

FormProvider.propTypes = {
    children: PropTypes.node.isRequired,
    value: PropTypes.shape({
        values: PropTypes.shape({}).isRequired,
        touched: PropTypes.shape({}).isRequired,
        errors: PropTypes.shape({}).isRequired,
        handleChange: PropTypes.func.isRequired,
        handleBlur: PropTypes.func.isRequired,
    }).isRequired,
};

export function useForm() {
    return useContext(formContext);
}

export function useValues() {
    return useForm().values;
}

export function useTocued() {
    return useForm().touched;
}

export function useErrors() {
    return useForm().errors;
}
