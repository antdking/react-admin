import * as React from 'react';
import expect from 'expect';
import { render, screen } from '@testing-library/react';
import { MutationMode } from 'ra-core';

import { AdminContext } from '../AdminContext';
import { CloneButton } from './CloneButton';

const invalidButtonDomProps = {
    invalid: false,
    pristine: false,
    record: { id: 123, foo: 'bar' },
    redirect: 'list',
    resource: 'posts',
    saving: false,
    submitOnEnter: true,
    mutationMode: 'pessimistic' as MutationMode,
};

describe('<CloneButton />', () => {
    it('should pass a clone of the record in the location state', () => {
        render(
            <AdminContext>
                <CloneButton
                    resource="posts"
                    record={{ id: 123, foo: 'bar' }}
                />
            </AdminContext>
        );

        expect(
            screen.getByLabelText('ra.action.clone').getAttribute('href')
        ).toEqual('#/posts/create?source=%7B%22foo%22%3A%22bar%22%7D');
    });

    it('should render as button type with no DOM errors', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <AdminContext>
                <CloneButton {...invalidButtonDomProps} />
            </AdminContext>
        );

        expect(spy).not.toHaveBeenCalled();
        expect(
            screen.getByLabelText('ra.action.clone').getAttribute('href')
        ).toEqual('#/posts/create?source=%7B%22foo%22%3A%22bar%22%7D');

        spy.mockRestore();
    });
});
