import { act, fireEvent, render, screen } from '@testing-library/react';
import { TextInput } from 'react-native';

import { FormDialog } from './FormDialog';
import { isModalFooterStacked } from '../responsive';

jest.mock('@dloizides/ui-icons', () => ({ SvgIcon: () => null }));

interface Overrides {
  loading?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const renderDialog = (overrides: Overrides = {}): ReturnType<typeof render> =>
  render(
    <FormDialog
      visible
      loading={overrides.loading}
      submitHint="Saves the name"
      submitLabel="Save name"
      title="Rename"
      onCancel={overrides.onCancel ?? jest.fn()}
      onSubmit={overrides.onSubmit ?? jest.fn()}
    >
      <TextInput testID="name-field" />
      <TextInput multiline testID="notes-field" />
    </FormDialog>,
  );

describe('FormDialog', () => {
  it('with the form submitted by Enter, calls onSubmit once', () => {
    const onSubmit = jest.fn();
    renderDialog({ onSubmit });
    const form = screen.getByTestId('name-field').closest('form') as HTMLFormElement;

    fireEvent.submit(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('while loading, submitting the form does not call onSubmit', () => {
    const onSubmit = jest.fn();
    renderDialog({ loading: true, onSubmit });
    const form = screen.getByTestId('name-field').closest('form') as HTMLFormElement;

    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('with the Save button pressed, calls onSubmit', () => {
    const onSubmit = jest.fn();
    renderDialog({ onSubmit });

    fireEvent.click(screen.getByTestId('form-save'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('with the Cancel button pressed, calls onCancel', () => {
    const onCancel = jest.fn();
    renderDialog({ onCancel });

    fireEvent.click(screen.getByTestId('form-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('while loading, the Cancel button is disabled', () => {
    renderDialog({ loading: true });

    const cancel = screen.getByTestId('form-cancel');

    expect(cancel.getAttribute('aria-disabled')).toBe('true');
  });

  it('on open, focuses the first field', async () => {
    renderDialog();

    await act(async () => {
      await Promise.resolve();
    });

    expect(document.activeElement).toBe(screen.getByTestId('name-field'));
  });
});

describe('isModalFooterStacked', () => {
  it('with a 360px window, returns true', () => {
    const width = 360;

    const result = isModalFooterStacked(width);

    expect(result).toBe(true);
  });

  it('with a 400px window, returns false', () => {
    const width = 400;

    const result = isModalFooterStacked(width);

    expect(result).toBe(false);
  });
});
