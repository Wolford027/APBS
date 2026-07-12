import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddSexModal from './AddSexModal';
import AddCivilStatusModal from './AddCivilStatusModal';
import AddDeducModal from './AddDeducModal';
import AddDmbModal from './AddDmbModal';
import AddEmpTypeModal from './AddEmpTypeModal';
import AddLeaveTypeModal from './AddLeaveTypeModal';
import AddLoanTypeModal from './AddLoanTypeModal';
import AddNprtrvModal from './AddNprtrvModal';
import AddPayrollSettingsModal from './AddPayrollSettingsModal';
import AddRateValueModal from './AddRateValueModal';

// All ten SystemVariable "add" modals share the exact same shape:
// {onOpen, onClose, onAdd, onChange, onValue} driving a single TextField
// plus Cancel/Add buttons, with the parent SystemVariable.jsx view owning
// the actual state and persistence. One parameterized suite covers the
// "creating a new record" wiring for all of them.
const MODALS = [
  ['AddSexModal', AddSexModal],
  ['AddCivilStatusModal', AddCivilStatusModal],
  ['AddDeducModal', AddDeducModal],
  ['AddDmbModal', AddDmbModal],
  ['AddEmpTypeModal', AddEmpTypeModal],
  ['AddLeaveTypeModal', AddLeaveTypeModal],
  ['AddLoanTypeModal', AddLoanTypeModal],
  ['AddNprtrvModal', AddNprtrvModal],
  ['AddPayrollSettingsModal', AddPayrollSettingsModal],
  ['AddRateValueModal', AddRateValueModal],
];

describe.each(MODALS)('%s (SystemVariable "add" modal)', (name, Modal) => {
  function setup(onValue = '') {
    const onClose = jest.fn();
    const onAdd = jest.fn();
    const onChange = jest.fn();
    render(<Modal onOpen onClose={onClose} onAdd={onAdd} onChange={onChange} onValue={onValue} />);
    return { onClose, onAdd, onChange };
  }

  test('renders a text field and Add/Cancel actions when open', () => {
    setup();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('is not rendered when closed', () => {
    render(<Modal onOpen={false} onClose={jest.fn()} onAdd={jest.fn()} onChange={jest.fn()} onValue="" />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('typing in the field calls onChange', async () => {
    const { onChange } = setup();
    await userEvent.type(screen.getByRole('textbox'), 'x');
    expect(onChange).toHaveBeenCalled();
  });

  test('clicking Add calls onAdd exactly once', async () => {
    const { onAdd } = setup('New Value');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  test('clicking Cancel calls onClose exactly once and not onAdd', async () => {
    const { onClose, onAdd } = setup();
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
