import { useEffect, useState } from 'react'
import PageLayout from '../../../shared/components/PageLayout'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import axios from 'axios'
import PremiumTable, { TableSkeleton, TableEmptyState } from '../../../shared/components/PremiumTable'
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SearchBar from '../../../shared/components/SearchBar'
import AddEmpModal from '../components/AddEmp';
import ViewEmpModal from '../components/ViewEmpModal';

export function normalizeEmployeeInfo(employee = {}) {
  return {
    ...employee,
    emp_religion: employee.emp_religion ?? employee.religion ?? '',
    emp_citi: employee.emp_citi ?? employee.citizenship ?? '',
    date_of_birth: employee.date_of_birth ?? employee.birthday ?? '',
    street_add: employee.street_add ?? employee.street ?? '',
    emp_pos: employee.emp_pos ?? employee.position ?? '',
    emp_ratetype: employee.emp_ratetype ?? employee.rate_type ?? '',
    emp_rate: employee.emp_rate ?? employee.salary_rate ?? '',
    emp_emptype: employee.emp_emptype ?? employee.emp_type ?? '',
    emp_dept: employee.emp_dept ?? employee.department ?? '',
    emp_datehired: employee.emp_datehired ?? employee.date_hired ?? '',
    emp_dateend: employee.emp_dateend ?? employee.date_end ?? '',
    emp_tin: employee.emp_tin ?? employee.tin_num ?? '',
    emp_sss: employee.emp_sss ?? employee.sss_num ?? '',
    emp_philhealth: employee.emp_philhealth ?? employee.philhealth_num ?? '',
    emp_hdmf: employee.emp_hdmf ?? employee.hdmf_num ?? '',
  };
}

export default function EmployeeList() {
  const [openModalAddEmp, setOpenModalAddEmp] = useState(false);
  const [openModalViewEmp, setOpenModalViewEmp] = useState(false);
  const [viewemp, setviewemp] = useState([]);
  const [selectedId, setSelectedId] = useState([]);
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true);

  // View Employee information
  const [emp_info, setemp_info] = useState({
    f_name: ""
  });

  // Fetch data
  useEffect(() => {
    fetchAlldata();
  }, []);

  const fetchAlldata = async () => {
    try {
      const res = await axios.get('http://localhost:8800/emp');
      setviewemp(res.data.map(normalizeEmployeeInfo));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModalViewEmp = async (id) => {
    setSelectedId(id);
    try {
      const res = await axios.get(`http://localhost:8800/emp/${id}`);
      setemp_info(normalizeEmployeeInfo(res.data[0]));
      setOpenModalViewEmp(true);
    } catch (err) {
      console.log(err);
    }
  };

  const [earningsData, setEarningsData] = useState({});
  const [addallowance, setAddAllowance] = useState([]);

  useEffect(() => {
    if (emp_info.emp_id) {
      const fetchEarningsAndBenefits = async () => {
        try {
          // Simultaneously fetch both datasets using Promise.all
          const [earningsRes, benefitsRes] = await Promise.all([
            axios.get(`http://localhost:8800/employee-earnings/${emp_info.emp_id}`),
            axios.get(`http://localhost:8800/emp-additional-benifits/${emp_info.emp_id}`)
          ]);
          const earnings = earningsRes.data[0];
          setEarningsData({
            empId: earnings.emp_id,
            fullName: earnings.full_name,
            riceAllow: earnings.rice_allow,
            clothingAllow: earnings.clothing_allow,
            laundryAllow: earnings.laundry_allow,
            medicalAllow: earnings.medical_allow,
          });
          setAddAllowance(benefitsRes.data);

        } catch (error) {
          console.error("Error fetching earnings or benefits data:", error);
        }
      };

      fetchEarningsAndBenefits();
    }
  }, [emp_info.emp_id]);

  const handleCloseModalViewEmp = () => {
    setOpenModalViewEmp(false);
  };

  // Add Employee information
  const handleOpenModalAddEmp = () => {
    setOpenModalAddEmp(true);
  };

  const handleCloseModalAddEmp = () => {
    setOpenModalAddEmp(false);
  };

  const filteredEmp = viewemp.filter((emp) => {
    const fullname = `${emp.f_name} ${emp.l_name}`.toLowerCase();
    return (
      emp.emp_id.toString().includes(search) ||
      fullname.includes(search.toLowerCase()) ||
      (emp.emp_pos || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <PageLayout title="Employee List">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar onSearchChange={(value) => setSearch(value)} />
        <Button color="primary" variant="contained" onClick={handleOpenModalAddEmp}>Add Employee</Button>
      </Box>
      <PremiumTable>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Employee ID</th>
                <th style={{ width: '30%' }}>Employee Name</th>
                <th style={{ width: '10%' }}>Employee Position</th>
                <th style={{ width: '10%' }}>Mobile Number</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={7} columns={['id', 'avatarText', 'text', 'number', 'button']} />
              ) : (search ? filteredEmp : viewemp).length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  icon={search ? PersonSearchRoundedIcon : GroupsRoundedIcon}
                  title={search ? 'No matching employees' : 'No employees yet'}
                  description={search
                    ? `Nothing matches “${search}”. Try a different ID, name, or position.`
                    : 'Employees you add will appear here. Use “Add Employee” to get started.'}
                />
              ) : (
                (search ? filteredEmp : viewemp).map((vm, i) => (
                  <tr key={i}>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.emp_id}</td>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.f_name + " " + vm.l_name}</td>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.emp_pos}</td>
                    <td style={{ cursor: 'pointer' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>{vm.mobile_num}</td>
                    <td>
                      <Button variant='contained' style={{ marginRight: 5, marginLeft: 5, width: '35%', fontSize: 12, fontWeight: 'bold' }} onClick={() => handleOpenModalViewEmp(vm.emp_id)}>View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </PremiumTable>
      <ViewEmpModal onOpen={openModalViewEmp} onClose={handleCloseModalViewEmp} emp_info={emp_info} selectedEmployee={{ id: selectedId }} addallowance={addallowance} earningsData={earningsData} />
      <AddEmpModal onOpen={openModalAddEmp} onClose={handleCloseModalAddEmp} />
    </PageLayout>
  );
}
