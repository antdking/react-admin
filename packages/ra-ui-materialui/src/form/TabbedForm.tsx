import * as React from 'react';
import {
    Children,
    isValidElement,
    ReactElement,
    ReactNode,
    HtmlHTMLAttributes,
} from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    FormProps,
    MutationMode,
    RaRecord,
    RedirectionSideEffect,
    OnSuccess,
    onError,
} from 'ra-core';
import get from 'lodash/get';

import { TabbedFormView } from './TabbedFormView';
import { useFormRootPath } from './useFormRootPath';

/**
 * Form layout where inputs are divided by tab, one input per line.
 *
 * Pass FormTab components as children.
 *
 * @example
 *
 * import * as React from "react";
 * import {
 *     Edit,
 *     TabbedForm,
 *     FormTab,
 *     Datagrid,
 *     TextField,
 *     DateField,
 *     TextInput,
 *     ReferenceManyField,
 *     NumberInput,
 *     DateInput,
 *     BooleanInput,
 *     EditButton
 * } from 'react-admin';
 *
 * export const PostEdit = (props) => (
 *     <Edit {...props}>
 *         <TabbedForm>
 *             <FormTab label="summary">
 *                 <TextInput disabled label="Id" source="id" />
 *                 <TextInput source="title" validate={required()} />
 *                 <TextInput multiline source="teaser" validate={required()} />
 *             </FormTab>
 *             <FormTab label="body">
 *                 <RichTextInput source="body" validate={required()} label={false} />
 *             </FormTab>
 *             <FormTab label="Miscellaneous">
 *                 <TextInput label="Password (if protected post)" source="password" type="password" />
 *                 <DateInput label="Publication date" source="published_at" />
 *                 <NumberInput source="average_note" validate={[ number(), minValue(0) ]} />
 *                 <BooleanInput label="Allow comments?" source="commentable" defaultValue />
 *                 <TextInput disabled label="Nb views" source="views" />
 *             </FormTab>
 *             <FormTab label="comments">
 *                 <ReferenceManyField reference="comments" target="post_id" label={false}>
 *                     <Datagrid>
 *                         <TextField source="body" />
 *                         <DateField source="created_at" />
 *                         <EditButton />
 *                     </Datagrid>
 *                 </ReferenceManyField>
 *             </FormTab>
 *         </TabbedForm>
 *     </Edit>
 * );
 *
 * @typedef {Object} Props the props you can use (other props are injected by Create or Edit)
 * @prop {ReactElement[]} FormTab elements
 * @prop {Object} defaultValues
 * @prop {Function} validate
 * @prop {boolean} submitOnEnter
 * @prop {string} redirect
 * @prop {ReactElement} toolbar The element displayed at the bottom of the form, containing the SaveButton
 * @prop {string} variant Apply variant to all inputs. Possible values are 'standard', 'outlined', and 'filled' (default)
 * @prop {string} margin Apply variant to all inputs. Possible values are 'none', 'normal', and 'dense' (default)
 *
 * @param {Props} props
 */
export const TabbedForm = (props: TabbedFormProps) => {
    const formRootPathname = useFormRootPath();

    return (
        <Form
            formRootPathname={formRootPathname}
            {...props}
            render={formProps => (
                <TabbedFormView
                    formRootPathname={formRootPathname}
                    {...formProps}
                />
            )}
        />
    );
};

TabbedForm.propTypes = {
    children: PropTypes.node,
    defaultValues: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    formRootPathname: PropTypes.string,
    mutationMode: PropTypes.oneOf(['pessimistic', 'optimistic', 'undoable']),
    // @ts-ignore
    record: PropTypes.object,
    redirect: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
        PropTypes.func,
    ]),
    save: PropTypes.func, // the handler defined in the parent, which triggers the REST submission
    saving: PropTypes.bool,
    submitOnEnter: PropTypes.bool,
    validate: PropTypes.func,
};

export interface TabbedFormProps
    extends Omit<FormProps, 'render'>,
        Omit<
            HtmlHTMLAttributes<HTMLFormElement>,
            'defaultValue' | 'onSubmit' | 'children'
        > {
    children: ReactNode;
    className?: string;
    defaultValues?: any;
    formRootPathname?: string;
    margin?: 'none' | 'normal' | 'dense';
    mutationMode?: MutationMode;
    record?: RaRecord;
    redirect?: RedirectionSideEffect;
    resource?: string;
    save?: (
        data: Partial<RaRecord>,
        redirectTo: RedirectionSideEffect,
        options?: {
            onSuccess?: OnSuccess;
            onError?: onError;
        }
    ) => void;
    submitOnEnter?: boolean;
    syncWithLocation?: boolean;
    tabs?: ReactElement;
    toolbar?: ReactElement;
    variant?: 'standard' | 'outlined' | 'filled';
    warnWhenUnsavedChanges?: boolean;
}

export const findTabsWithErrors = (children, errors) => {
    console.warn(
        'Deprecated. FormTab now wrap their content inside a FormGroupContextProvider. If you implemented custom forms with tabs, please use the FormGroupContextProvider. See https://marmelab.com/react-admin/CreateEdit.html#grouping-inputs'
    );

    return Children.toArray(children).reduce((acc: any[], child) => {
        if (!isValidElement(child)) {
            return acc;
        }

        const inputs = Children.toArray(child.props.children);

        if (
            inputs.some(
                input =>
                    isValidElement(input) && get(errors, input.props.source)
            )
        ) {
            return [...acc, child.props.label];
        }

        return acc;
    }, []);
};
