import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import AddEmp, { getEmployeeDraftStorageKey } from './AddEmp';

jest.mock('axios');
jest.mock('./ImageUpload', () => function MockImageUpload() {
  return <div data-testid="image-upload" />;
});

function mockLookupRequests() {
  axios.get.mockImplementation((url) => {
    if (url.includes('/cs')) return Promise.resolve({ data: [{ cs_name: 'Single' }] });
    if (url.includes('/religion')) return Promise.resolve({ data: [{ religion_name: 'Catholic' }] });
    if (url.includes('/sex')) return Promise.resolve({ data: [{ sex_name: 'Female' }] });
    if (url.includes('/employment_type')) return Promise.resolve({ data: [{ employment_type_name: 'Regular' }] });
    if (url.includes('/status')) return Promise.resolve({ data: [{ emp_status_name: 'Active' }] });
    if (url.includes('/fetch-department')) return Promise.resolve({ data: [{ dept_name: 'HR' }] });
    if (url.includes('/rate-type-value')) {
      return Promise.resolve({
        data: [{ emp_ratetype_id: 1, position: 'Staff', pos_rt_val: 1000 }],
      });
    }
    if (url.includes('/rate-type')) return Promise.resolve({ data: [{ rt_id: 1, rt_name: 'Monthly' }] });
    return Promise.resolve({ data: [] });
  });
}

function fullEmployeeDraft(overrides = {}) {
  return {
    firstname: 'Ada',
    surname: 'Lovelace',
    selectedCivilStatus: { cs_name: 'Single' },
    selectedSex: { sex_name: 'Female' },
    dateofbirth: '1990-01-01T00:00:00.000Z',
    selectedProvince1: 'CAVITE',
    selectedMunicipality1: 'BACOOR CITY',
    email: 'ada@example.com',
    number: '9123456789',
    selectedRegion: { region_name: 'REGION IV-A' },
    selectedProvince: 'CAVITE',
    selectedMunicipality: 'BACOOR CITY',
    selectedBarangay: 'ALIMA',
    streetadd: '1 Draft Street',
    selectedStatus: { emp_status_name: 'Active' },
    selectedEmploymentType: { employment_type_name: 'Regular' },
    selectedPosition: { position: 'Staff' },
    selectedRateType: { rt_id: 1, rt_name: 'Monthly' },
    selectedRateValue: { pos_rt_val: 1000 },
    selectedDepartment: { dept_name: 'HR' },
    datestart: '2026-01-01T00:00:00.000Z',
    sss: '12-3456789-0',
    philHealth: '12-345678901-2',
    tin: '123-456-789-000',
    hdmf: '1234-5678-9012',
    input: [],
    input1: [],
    input2: [],
    ...overrides,
  };
}

describe('AddEmp draft handling', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockLookupRequests();
  });

  test('saves entered employee data as a draft when closing the modal', async () => {
    const onClose = jest.fn();

    render(<AddEmp onOpen onClose={onClose} />);

    await userEvent.type(screen.getByPlaceholderText(/enter first name/i), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(getEmployeeDraftStorageKey()))).toEqual(
      expect.objectContaining({ firstname: 'Ada' })
    );
  });

  test('closes without saving a draft when there are no employee entries', async () => {
    const onClose = jest.fn();

    render(<AddEmp onOpen onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/close this employee form/i)).not.toBeInTheDocument();
    expect(localStorage.getItem(getEmployeeDraftStorageKey())).toBeNull();
  });

  test('restores an existing employee draft when the create modal opens', async () => {
    localStorage.setItem(
      getEmployeeDraftStorageKey(),
      JSON.stringify({
        firstname: 'Ada',
        surname: 'Lovelace',
        input: [],
        input1: [],
        input2: [],
      })
    );

    render(<AddEmp onOpen onClose={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ada')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Lovelace')).toBeInTheDocument();
    });
    expect(screen.getByText(/employee draft restored/i)).toBeInTheDocument();
  });

  test('clears the restored employee draft when the form is reset', async () => {
    localStorage.setItem(
      getEmployeeDraftStorageKey(),
      JSON.stringify({
        firstname: 'Ada',
        input: [],
        input1: [],
        input2: [],
      })
    );

    render(<AddEmp onOpen onClose={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ada')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(localStorage.getItem(getEmployeeDraftStorageKey())).toBeNull();
    expect(screen.queryByDisplayValue('Ada')).not.toBeInTheDocument();
  });

  test('saves the current employee draft when the browser goes offline', async () => {
    render(<AddEmp onOpen onClose={jest.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(/enter first name/i), 'Grace');
    window.dispatchEvent(new Event('offline'));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(getEmployeeDraftStorageKey()))).toEqual(
        expect.objectContaining({ firstname: 'Grace' })
      );
    });
  });

  test('clears the employee draft after a successful save', async () => {
    const onClose = jest.fn();
    axios.post.mockResolvedValue({ data: { insertId: 42 } });
    localStorage.setItem(
      getEmployeeDraftStorageKey(),
      JSON.stringify(fullEmployeeDraft())
    );

    render(<AddEmp onOpen onClose={onClose} />);

    await waitFor(() => expect(screen.getByDisplayValue('Ada')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /save employee/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem(getEmployeeDraftStorageKey())).toBeNull();
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8800/AddEmp',
      expect.objectContaining({ firstname: 'Ada', surname: 'Lovelace' })
    );
  });

  test('retries a partially saved draft without creating a duplicate employee', async () => {
    const onClose = jest.fn();
    localStorage.setItem(
      getEmployeeDraftStorageKey(),
      JSON.stringify(fullEmployeeDraft({
        input: [{ school_id: 3, institutionName: 'State University', degree: 'BS Math', year: '2010' }],
      }))
    );
    axios.post.mockImplementation((url) => {
      if (url.includes('/AddEmp')) return Promise.resolve({ data: { insertId: 42 } });
      if (url.includes('/AddEducbg')) return Promise.reject(new Error('network down'));
      return Promise.resolve({ data: {} });
    });

    const { unmount } = render(<AddEmp onOpen onClose={onClose} />);
    await waitFor(() => expect(screen.getByDisplayValue('Ada')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /save employee/i }));
    await waitFor(() => expect(screen.getByText(/saved as a draft/i)).toBeInTheDocument());
    unmount();

    axios.post.mockClear();
    axios.post.mockResolvedValue({ data: {} });
    render(<AddEmp onOpen onClose={onClose} />);
    await waitFor(() => expect(screen.getByDisplayValue('Ada')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /save employee/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(axios.post).not.toHaveBeenCalledWith(
      'http://localhost:8800/AddEmp',
      expect.anything()
    );
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8800/AddEducbg',
      expect.arrayContaining([expect.objectContaining({ emp_id: 42 })])
    );
    expect(localStorage.getItem(getEmployeeDraftStorageKey())).toBeNull();
  });
});
