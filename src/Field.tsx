import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from './context';

/**
 * @param {Object} props
 * @param {(React.FunctionComponent|React.ComponentClass|string)} props.component
 * @param {(boolean|string|number)} [props.defaultValue]
 * @param {string} props.name
 * @param {Array<Function>} [props.validation]
 */
export function Field({ component, defaultValue, name, validation, ...rest }) {
    const { handleChange, handleBlur, values, registerField, unregisterField, errors } = useForm();

    useEffect(() => {
        const value = defaultValue || '';
        const validators = validation || [];

        registerField(name, value, validators);

        return () => {
            unregisterField(name);
        };
    }, [name, validation]);

    return React.createElement(component, {
        onChange: handleChange,
        onBlur: handleBlur,
        value: values[name] || '',
        error: errors[name],
        name,
        ...rest,
    });
}

Field.propTypes = {
    component: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    validation: PropTypes.arrayOf(PropTypes.func),
};
