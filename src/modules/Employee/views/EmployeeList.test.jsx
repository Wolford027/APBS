import { normalizeEmployeeInfo } from './EmployeeList';

jest.mock('@toolpad/core', () => ({
  useDialogs: () => ({
    alert: jest.fn(),
    confirm: jest.fn(),
  }),
}));

describe('normalizeEmployeeInfo', () => {
  test('maps deployed employee database columns to the view modal aliases', () => {
    const employee = normalizeEmployeeInfo({
      emp_id: 1,
      f_name: 'Kim',
      l_name: 'Chaewon',
      citizenship: 'Filipino',
      religion: 'Roman Catholic',
      birthday: '1899-11-30T00:00:00.000Z',
      street: '326 Nawasa Street',
      emp_type: 'Regular',
      position: 'Manager',
      rate_type: 'Monthly',
      salary_rate: '50000.00',
      department: 'IT',
      date_hired: '1899-11-30T00:00:00.000Z',
      date_end: null,
      tin_num: '22-2222222-2',
      sss_num: '22-121212121-2',
      philhealth_num: '3423-3423-4234',
      hdmf_num: '111-111-111-111',
    });

    expect(employee).toEqual(expect.objectContaining({
      emp_citi: 'Filipino',
      emp_religion: 'Roman Catholic',
      date_of_birth: '1899-11-30T00:00:00.000Z',
      street_add: '326 Nawasa Street',
      emp_emptype: 'Regular',
      emp_pos: 'Manager',
      emp_ratetype: 'Monthly',
      emp_rate: '50000.00',
      emp_dept: 'IT',
      emp_datehired: '1899-11-30T00:00:00.000Z',
      emp_dateend: '',
      emp_tin: '22-2222222-2',
      emp_sss: '22-121212121-2',
      emp_philhealth: '3423-3423-4234',
      emp_hdmf: '111-111-111-111',
    }));
  });

  test('keeps existing legacy alias values when they are present', () => {
    const employee = normalizeEmployeeInfo({
      position: 'Manager',
      emp_pos: 'Supervisor',
      salary_rate: '50000.00',
      emp_rate: '25000.00',
    });

    expect(employee.emp_pos).toBe('Supervisor');
    expect(employee.emp_rate).toBe('25000.00');
  });
});
