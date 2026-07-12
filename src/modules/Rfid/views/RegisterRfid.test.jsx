import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import RegisterRfid from './RegisterRfid';

jest.mock('axios');

const EMPLOYEES = [
  { emp_id: 1, f_name: 'Jane', l_name: 'Doe' },
  { emp_id: 2, f_name: 'John', l_name: 'Smith' },
];

describe('RegisterRfid', () => {
  let alertSpy;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.get.mockResolvedValue({ data: EMPLOYEES });
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test('fetches the employee list on mount', async () => {
    render(<RegisterRfid />);
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8800/fetch-emp-info')
    );
  });

  test('registering without selecting an employee alerts and does not call the API', async () => {
    render(<RegisterRfid />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/rfid id no/i), '1234567890');
    await userEvent.click(screen.getByRole('button', { name: /register rfid/i }));

    expect(alertSpy).toHaveBeenCalledWith('Please select an employee');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('selecting an employee and registering posts the rfid + emp_id', async () => {
    axios.post.mockResolvedValue({ data: { message: 'RFID registered successfully!' } });

    render(<RegisterRfid />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/search employee/i), 'Jane');
    const option = await screen.findByText('Jane Doe');
    await userEvent.click(option);

    await userEvent.type(screen.getByLabelText(/rfid id no/i), '1234567890');
    await userEvent.click(screen.getByRole('button', { name: /register rfid/i }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8800/register-rfid', {
        rfid: '1234567890',
        emp_id: 1,
      })
    );
    expect(alertSpy).toHaveBeenCalledWith('RFID registered successfully!');
  });

  test('a failed registration alerts the user with a failure message', async () => {
    axios.post.mockResolvedValue({ data: { message: 'nope' } });

    render(<RegisterRfid />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    await userEvent.type(screen.getByLabelText(/search employee/i), 'John');
    const option = await screen.findByText('John Smith');
    await userEvent.click(option);
    await userEvent.type(screen.getByLabelText(/rfid id no/i), '0987654321');
    await userEvent.click(screen.getByRole('button', { name: /register rfid/i }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Failed to register RFID. Please try again.')
    );
  });
});
