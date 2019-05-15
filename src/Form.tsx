import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from './context';

export function Form({ children }) {
    const { handleSubmit } = useForm();
    return <form onSubmit={handleSubmit}>{children}</form>;
}

Form.propTypes = {
    children: PropTypes.node.isRequired,
};
