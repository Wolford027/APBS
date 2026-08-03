import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import ViewEmpModal from './ViewEmpModal';

jest.mock('axios');
jest.mock('@toolpad/core', () => ({
  useDialogs: () => ({
    alert: jest.fn(),
    confirm: jest.fn(),
  }),
}));

const employeeInfo = {
  id: 7,
  emp_id: 'EMP-007',
  f_name: 'Kim',
  l_name: 'Chaewon',
  m_name: '',
  suffix: '',
  civil_status: 'Single',
  sex: 'Female',
  emp_citi: '',
  emp_religion: '',
  date_of_birth: '',
  province_of_birth: 'CAVITE',
  city_of_birth: 'CAVITE CITY',
  email: 'kim@example.com',
  mobile_num: '9951432116',
  region: 'REGION IV-A',
  province: 'CAVITE',
  city: 'CAVITE CITY',
  barangay: 'BARANGAY 42-A (PINAGBUKLOD A)',
  street_add: '',
  emp_status: 'Active',
  emp_emptype: '',
  emp_pos: '',
  emp_rate: 0,
  emp_ratetype: '',
  emp_dept: '',
  emp_datehired: '',
  emp_dateend: '',
  emp_tin: '',
  emp_sss: '',
  emp_philhealth: '',
  emp_hdmf: '',
};

describe('ViewEmpModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  test('keeps populated read-only field labels shrunk above their values', async () => {
    render(
      <ViewEmpModal
        onOpen
        onClose={jest.fn()}
        emp_info={employeeInfo}
        selectedEmployee={{ id: employeeInfo.id }}
        addallowance={[]}
        earningsData={{}}
      />
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(screen.getByDisplayValue('Chaewon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kim')).toBeInTheDocument();
    expect(screen.getByDisplayValue('kim@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('REGION IV-A')).toBeInTheDocument();

    expect(getFieldLabel('Surname')).toHaveClass('MuiInputLabel-shrink');
    expect(getFieldLabel('First Name')).toHaveClass('MuiInputLabel-shrink');
    expect(getFieldLabel('Email Address')).toHaveClass('MuiInputLabel-shrink');
    expect(getFieldLabel('Region')).toHaveClass('MuiInputLabel-shrink');
  });
});

function getFieldLabel(name) {
  return screen.getAllByText(name).find((element) => element.tagName.toLowerCase() === 'label');
}
