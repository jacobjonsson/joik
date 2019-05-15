import React, { useReducer, useEffect, ReactNode, FormEvent, ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import { FormProvider } from './context';
import { FormValues, FormSubmitHandler, FormState, FormFields, FormErrors, FormValue, FormValidator, FormContext } from 'typings';

/**
 * A form value.
 * @typedef {(string|number|boolean)} FormValue
 */

/**
 * A validation function that will validate a form value.
 * @typedef {(value: FormValue) => string} FormValidator
 */

function init(initialValues: FormValues) {
    return {
        values: initialValues || {},
        touched: {},
        errors: {},
        fields: {},
        isSubmitting: false,
        isValidating: false,
        submitSucceeded: false,
    };
}

function reducer(state: FormState, action) {
    switch (action.type) {
        case 'REGISTER_FIELD': {
            // FIXME: Does not seem to work with keys like: 'product.amount',
            // They should be in subObjects.
            // Or maybe they should be flat. Not sure what's best.
            return {
                ...state,
                fields: {
                    ...state.fields,
                    [action.name]: action.validation,
                },
                errors: {
                    ...state.errors,
                    [action.name]: '',
                },
                values: {
                    ...state.values,
                    [action.name]: state.values[action.name] || '',
                },
                touched: {
                    ...state.touched,
                    [action.name]: false,
                },
            };
        }
        case 'REMOVE_FIELD': {
            const fields = { ...state.fields };
            delete fields[action.name];

            return {
                ...state,
                fields,
            };
        }
        case 'FIELD':
            return {
                ...state,
                values: {
                    ...state.values,
                    [action.name]: action.value,
                },
            };
        case 'BLUR': {
            return {
                ...state,
                touched: {
                    ...state.touched,
                    [action.name]: true,
                },
            };
        }
        case 'ERROR': {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.name]: action.error,
                },
            };
        }
        case 'BATCH_ERROR': {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    ...action.errors,
                },
            };
        }
        case 'SUBMITTING': {
            return {
                ...state,
                isSubmitting: true,
            };
        }
        case 'FINISHED_SUBMITTING': {
            return {
                ...state,
                isSubmitting: false,
            };
        }
        case 'RESET_FORM': {
            return {
                ...init(action.initialValues),
                fields: state.fields,
            };
        }
        default:
            throw new Error(`Invalid action type: ${action.type} supplied`);
    }
}

interface JoikProps {
    children: ReactNode;
    onSubmit: FormSubmitHandler;
    initialValues: FormValues;
}

export function Joik({ children, onSubmit, initialValues }: JoikProps) {
    const [state, dispatch] = useReducer(reducer, initialValues, init);

    // Reset form when initialValues changes.
    useEffect(() => {
        dispatch({ type: 'RESET_FORM', initialValues });
    }, [initialValues]);

    /**
     * @param {React.FormEvent<HTMLFormElement>} event
     */
    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        dispatch({ type: 'SUBMITTING' });

        const hasErrors = runAllValidation(state.fields, state.values);

        // Only run submit function if no errors exist.
        if (!hasErrors) {
            onSubmit(state.values);
        }

        dispatch({ type: 'FINISHED_SUBMITTING' });
    }

    /**
     * @param {React.ChangeEvent<any>} event
     */
    function handleChange(event: ChangeEvent<any>) {
        const value = event.target === 'checkbox' ? event.target.checked : event.target.value;
        const name = event.target.name;

        dispatch({ type: 'FIELD', name, value });
    }

    /**
     * @param {React.FocusEvent<any>} event
     */
    function handleBlur(event: React.FocusEvent<any>) {
        const name = event.target.name;
        const value = state.values[name];
        dispatch({ type: 'BLUR', name });

        runFieldValidation(name, value);
    }

    function runAllValidation(fields: FormFields, values: FormValues) {
        const errors: FormErrors = {};

        Object.keys(fields).forEach(fieldName => {
            const value = values[fieldName];
            let error = '';

            getValidatorsForField(fieldName).forEach(validation => {
                let err = validation(value);
                if (err) {
                    error = err;
                }
            });

            errors[fieldName] = error;
        });

        // Check if the error
        const hasErrors = Object.values(errors).some(error => !!error);
        dispatch({ type: 'BATCH_ERROR', errors });

        return hasErrors;
    }

    /**
     *
     * @param {string} name
     * @param {FormValue} value
     */
    function runFieldValidation(name, value) {
        let error = '';

        // Reverse order of validation to ensure the first validation function ov
        getValidatorsForField(name).forEach(validation => {
            const err = validation(value);
            if (err) {
                error = err;
            }
        });

        // Always dispatch the updated error regardless if an error occurred or not.
        dispatch({ type: 'ERROR', name, error });
    }

    /**
     * Returns all the validator functions for the passed field.
     * @param {string} name
     * @returns {FormValidator[]}
     */
    function getValidatorsForField(name) {
        const validators = state[name];
        if (!Array.isArray(validators)) return [];

        // Reverse the order to make sure we run in the right order.
        return validators.reverse();
    }

    /**
     * Registers a field and it's validation functions
     * @param {string} name
     * @param {FormValue} value
     * @param {FormValidator[]} validation
     */
    function registerField(name: string, value: FormValue, validation: FormValidator) {
        dispatch({ type: 'REGISTER_FIELD', name, validation, value });
    }

    function unregisterField(name: string) {
        // Clear the all values and errors for field.
        dispatch({ type: 'REMOVE_FIELD', name });
    }

    const values: FormContext = {
        ...state,
        handleSubmit,
        handleChange,
        handleBlur,
        registerField,
        unregisterField,
    };

    return <FormProvider value={values}>{children}</FormProvider>;
}

Joik.propTypes = {
    children: PropTypes.node.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.shape({}),
};
