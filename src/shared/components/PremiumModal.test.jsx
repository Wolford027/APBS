import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PremiumModal from './PremiumModal';

const FakeIcon = () => <span data-testid="modal-icon" />;

function setup(props = {}) {
  const onClose = jest.fn();
  render(
    <PremiumModal
      open
      onClose={onClose}
      title="Confirm Action"
      subtitle="This explains the action."
      actions={<button type="button">Save</button>}
      {...props}
    >
      <div>Modal body content</div>
    </PremiumModal>
  );
  return { onClose };
}

describe('PremiumModal', () => {
  test('renders title, subtitle, body, and actions when open', () => {
    setup({ icon: FakeIcon });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('This explains the action.')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByTestId('modal-icon')).toBeInTheDocument();
  });

  test('renders nothing when closed', () => {
    render(
      <PremiumModal open={false} onClose={jest.fn()} title="Hidden">
        <div>Hidden body</div>
      </PremiumModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();
  });

  test('close button calls onClose', async () => {
    const { onClose } = setup();

    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('pressing Escape calls onClose', () => {
    const { onClose } = setup();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('disableBackdropClose blocks Escape and backdrop dismissal but keeps the close button working', async () => {
    const { onClose } = setup({ disableBackdropClose: true });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    fireEvent.click(document.querySelector('.MuiBackdrop-root'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
