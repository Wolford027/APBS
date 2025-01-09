import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Button, MenuItem, Select, TextField } from '@mui/material'
import AddDeducModal from '../_Modals/AddDeducModal'
import AddNprtrvModal from '../_Modals/AddNprtrvModal'
import AddLeaveModal from '../_Modals/AddLeaveType'
import AddDmbModal from '../_Modals/AddDmbModal'
import axios from 'axios'

const drawerWidth = 240

export default function SystemVariable() {
  const [deductions, setDeductions] = useState(() => {
    // Get deductions from localStorage on initial load
    const storedDeductions = localStorage.getItem('deductions')
    return storedDeductions ? JSON.parse(storedDeductions) : []
  })
  const [deducTitle, setDeducTitle] = useState('')
  const [deducModal, setDeducModal] = useState(false)
  const [dayValue, setDayValue] = useState(() => {
    const storedDayValue = localStorage.getItem('dayValue')
    return storedDayValue ? JSON.parse(storedDayValue) : { value: '', editable: true}
  })
  const [isDayEditable, setIsDayEditable] = useState(true)
  const [timeStart, setTimeStart] = useState(() => {
    const storedTimeStart = localStorage.getItem('timeStart')
    return storedTimeStart ? JSON.parse(storedTimeStart) : { value: '', editable: true}
  })
  const [tax, setTax] = useState(() => {
    // Get tax from localStorage on initial load
    const storedTax = localStorage.getItem('tax')
    return storedTax ? JSON.parse(storedTax) : { value: '', editable: true }
  })
  const [nprtrv, setNprtrv] = useState(() => {
    const storedNprtrv = localStorage.getItem('nprtrv')
    return storedNprtrv ? JSON.parse(storedNprtrv) : []
  })
  const [nprtrvModal, setNprtrvModal] = useState(false)
  const [nprtrvTitle, setNprtrvTitle] = useState('')
  const [leave, setLeave] = useState(() => {
    const storedLeave = localStorage.getItem('leave')
    return storedLeave ? JSON.parse(storedLeave) : []
  })
  const [leaveModal, setLeaveModal] = useState(false)
  const [leaveTitle, setLeaveTitle] = useState('')
  const [dmb, setDmb] = useState(() => {
    const storedDmb = localStorage.getItem('dmb')
    return storedDmb ? JSON.parse(storedDmb) : []
  })
  const [dmbModal, setDmbModal] = useState(false)
  const [dmbTitle, setDmbTitle] = useState('')

  // Save deductions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deductions', JSON.stringify(deductions))
  }, [deductions])

  // Save tax to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tax', JSON.stringify(tax))
  }, [tax])

  // Save dayValue to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dayValue', JSON.stringify(dayValue))
  }, [dayValue])

  // Save timeStart to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeStart', JSON.stringify(timeStart))
  }, [timeStart])

  const fetchDMBData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-dmb');
      if (response.data) {
        setDmb(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch De Minimis Benifit', error);
    }
  };

  const fetchLeaveData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-leave');
      if (response.data) {
        setLeave(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Leave Type', error);
    }
  }

  const fetchNprtrvData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-nprtrv');
      if (response.data) {
        setNprtrv(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Position, Rate Type & Rate Value', error);
    }
  }

  const fetchDeducData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-deduc');
      if (response.data) {
        setDeductions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Deductions', error);
    }
  }

  const fetchTaxData = async () => {
    try {
      const response = await axios.get('http://localhost:8800/get-tax');
      if (response.data) {
        setTax(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Tax Rate', error);
    }
  }

  useEffect(() => {
    fetchDMBData();
    fetchLeaveData();
    fetchNprtrvData();
    fetchDeducData();
    fetchTaxData();
  }, []);

  const OpenAddDeduc = () => setDeducModal(true)
  const CloseAddDeduc = () => {
    setDeducModal(false)
    setDeducTitle('')
  }

  const AddDeductions = () => {
    if (deducTitle.trim()) {
      setDeductions([...deductions, { title: deducTitle, value: '', editable: true }])
      setDeducTitle('')
      setDeducModal(false)
    }
  }

  const DeducValueChange = (index, event) => {
    const newValue = event.target.value.replace(/\D/, '') // Allow only numbers
    const newDeduc = deductions.map((deduc, i) =>
      i === index ? { ...deduc, value: newValue } : deduc
    )
    setDeductions(newDeduc)
  }

  const DeducSave = async (index) => {
    const deducSave = deductions[index];

    try {
      const response = await axios.post('http://localhost:8800/save-deduc', {
        title: deducSave.title,
        value: deducSave.value,
      });

      if (response.status === 200) {
        const updateDeduc = deductions.map((Deduc, i) =>
          i === index ? { ...Deduc, editable: false } : Deduc
        )
        setDeductions(updateDeduc)
        console.log('New Deduction saved successfully', response.data);
      } else {
        console.log('Failed to save a New Deduction', response.data);
      }
    } catch (error) {
      console.error('Failed to save a New Deduction', error);
    }
  }

  const DeducRemove = (index) => {
    const newDeduc = deductions.filter((_, i) => i !== index)
    setDeductions(newDeduc)
  }

  const DeducEdit = (index) => {
    const newDeduc = deductions.map((deduc, i) =>
      i === index ? { ...deduc, editable: true } : deduc
    )
    setDeductions(newDeduc)
  }

  const TaxChange = (event) => {
    const newValue = event.target.value.replace(/\D/, '') // Allow only numbers
    setTax({ ...tax, value: newValue })
  }

  const saveTax = async (index) => {
    try {
      const response = await axios.post('http://localhost:8800/save-tax', {
        tax_value: tax.tax_value,
      });

      if (response.status === 200) {
        setTax({ ...tax, editable: false })
        console.log('New Tax saved successfully', response.data);
      } else {
        console.log('Failed to save a New Tax', response.data);
      }
    } catch (error) {
      console.error('Failed to save a New Tax', error);
    }
  }

  const editTax = () => {
    setTax({ ...tax, editable: true })
  }

  const TimeStartChange = (event) => {
    const newValue = event.target.value
    setTimeStart({ ...timeStart, value: newValue})
  }

  const saveTimeStart = () => {
    setTimeStart({ ...timeStart, editable: false})
    setIsDayEditable(false)
  }

  const editTimeStart = () => {
    setTimeStart({ ...timeStart, editable: true})
    setIsDayEditable(true)
  }

  const dayChange = (event) => {
    setDayValue(event.target.value)
  }

  const OpenAddNprtrv = () => setNprtrvModal(true)
  const CloseNprtrv = () => {
    setNprtrvModal(false)
    setNprtrvTitle('')
  }

  const AddNprtrv = () => {
    if (nprtrvTitle.trim()) {
      setNprtrv([...nprtrv, {title: nprtrvTitle, value: '', editable: true}])
      setNprtrvTitle('')
      setNprtrvModal(false)
    }
  }

  const NprtrvValueChange = (index, event) => {
    const newValue = event.target.value.replace(/\D/, '') // Allow only numbers
    const newNprtrv = nprtrv.map((Nprtrv, i) =>
      i === index ? { ...Nprtrv, value: newValue } : Nprtrv
    )
    setNprtrv(newNprtrv)
  }

  const NprtrvSave = async (index) => {
    const nprtrvSave = nprtrv[index];

    try {
      const response = await axios.post('http://localhost:8800/save-nprtrv', {
        title: nprtrvSave.title,
        value: nprtrvSave.value,
      });

      if (response.status === 200) {
        const updateNprtrv = nprtrv.map((Nprtrv, i) =>
          i === index ? { ...Nprtrv, editable: false } : Nprtrv
        )
        setNprtrv(updateNprtrv)
        console.log('New NPRTRV saved successfully', response.data);
      } else {
        console.log('Failed to save a New NPRTRV', response.data);
      }
    } catch (error) {
      console.error('Failed to save a New NPRTRV', error);
    }
  }

  const NprtrvRemove = (index) => {
    const newNprtrv = nprtrv.filter((_, i) => i !== index)
    setNprtrv(newNprtrv)
  }

  const NprtrvEdit = (index) => {
    const newNprtrv = nprtrv.map((Nprtrv, i) =>
      i === index ? { ...Nprtrv, editable: true } : Nprtrv
    )
    setNprtrv(newNprtrv)
  }

  const OpenAddLeave = () => setLeaveModal(true)
  const CloseLeave = () => {
    setLeaveModal(false)
    setLeaveTitle('')
  }

  const AddLeave = () => {
    if (leaveTitle.trim()) {
      setLeave([...leave, {title: leaveTitle, value: '', editable: true}])
      setLeaveTitle('')
      setLeaveModal(false)
    }
  }

  const LeaveValueChange = (index, event) => {
    const newValue = event.target.value.replace(/\D/, '') // Allow only numbers
    const newLeave = leave.map((Leave, i) =>
      i === index ? { ...Leave, value: newValue } : Leave
    )
    setLeave(newLeave)
  }

  const LeaveSave = async (index) => {
    const leaveSave = leave[index];

    try {
      const response = await axios.post('http://localhost:8800/save-leave', {
        title: leaveSave.title,
        value: leaveSave.value,
      });

      if (response.status === 200) {
        const updateLeave = leave.map((Leave, i) =>
          i === index ? { ...Leave, editable: false } : Leave
        )
        setLeave(updateLeave)
        console.log('New Leave Type saved successfully', response.data);
      } else {
        console.log('Failed to save a New Leave Type', response.data);
      }
    } catch (error) {
      console.error('Failed to save a New Leave Type', error);
    }
  }

  const LeaveRemove = (index) => {
    const newLeave = leave.filter((_, i) => i !== index)
    setLeave(newLeave)
  }

  const LeaveEdit = (index) => {
    const newLeave = leave.map((Leave, i) =>
      i === index ? { ...Leave, editable: true } : Leave
    )
    setLeave(newLeave)
  }

  const OpenAddDmb = () => setDmbModal(true)
  const CloseDmb = () => {
    setDmbModal(false)
    setDmbTitle('')
  }

  const AddDmb = () => {
    if (dmbTitle.trim()) {
      setDmb([...dmb, {title: dmbTitle, value: '', editable: true}])
      setDmbTitle('')
      setDmbModal(false)
    }
  }

  const DmbSave = async (index) => {
    const dmbSave = dmb[index];

    try {
      const response = await axios.post('http://localhost:8800/save-dmb', {
        title: dmbSave.title,
        value: dmbSave.value,
      });

      if (response.status === 200) {
        const updateDmb = dmb.map((Dmb, i) =>
          i === index ? { ...Dmb, editable: false } : Dmb
        )
        setDmb(updateDmb)
        console.log('De Minimis Benifit saved successfully', response.data);
      } else {
        console.log('Failed to save De Minimis Benifit', response.data);
      }
    } catch (error) {
      console.error('Failed to save De Minimis Benifit', error);
    }
  }

  const DmbValueChange = (index, event) => {
    const newValue = event.target.value.replace(/\D/, '') // Allow only numbers
    const newDmb = dmb.map((Dmb, i) =>
      i === index ? { ...Dmb, value: newValue } : Dmb
    )
    setDmb(newDmb)
  }

  const DmbRemove = (index) => {
    const newDmb = dmb.filter((_, i) => i !== index)
    setDmb(newDmb)
  }

  const DmbEdit = (index) => {
    const newDmb = dmb.map((Dmb, i) =>
      i === index ? { ...Dmb, editable: true } : Dmb
    )
    setDmb(newDmb)
  }


  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            System Variable
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, p: 3, mt: 8, ml: -12 }}>

        {/*De Minimis Benifit Type Section */}
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2', mb: 2 }}>
            New De Minimis Benefit
          </Typography>
          <Button variant="contained" color="primary" onClick={OpenAddDmb}>
            Add De Minimis Benefit
          </Button>
          <Box
            sx={{
              mt: 1,
              height: '300px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              padding: 2,
            }}
          >
            {dmb.length > 0 ? (
              dmb.map((Dmb, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
                    {Dmb.dmb_name || Dmb.title}
                  </Typography>
                  <TextField
                    value={Dmb.dmb_value}
                    onChange={(e) => DmbValueChange(index, e)}
                    variant="outlined"
                    sx={{
                      mr: 2,
                      '& .MuiInputBase-input.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                    InputProps={{
                      startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                      readOnly: !Dmb.editable,
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      style: { color: Dmb.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
                    }}
                  />
                  {Dmb.editable ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" onClick={() => DmbSave(index)}>
                        Save
                      </Button>
                      <Button variant="outlined" onClick={() => DmbRemove(index)}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button variant="outlined" onClick={() => DmbEdit(index)}>
                      Edit
                    </Button>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                No available De Minimis Benefits.
              </Typography>
            )}
          </Box>
        </Box>

        {/* Leave Type Section */}
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2', mb: 2 }}>
            New Leave Type
          </Typography>
          <Button variant="contained" color="primary" onClick={OpenAddLeave}>
            Add Leave Type
          </Button>
          <Box
            sx={{
              mt: 1,
              height: '300px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              padding: 2,
            }}
          >
            {leave.length > 0 ? (
              leave.map((Leave, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
                    {Leave.leave_name || Leave.title}
                  </Typography>
                  <TextField
                    value={Leave.leave_value}
                    onChange={(e) => LeaveValueChange(index, e)}
                    variant="outlined"
                    sx={{
                      mr: 2,
                      '& .MuiInputBase-input.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                    InputProps={{
                      startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                      readOnly: !Leave.editable,
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      style: { color: Leave.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
                    }}
                  />
                  {Leave.editable ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" onClick={() => LeaveSave(index)}>
                        Save
                      </Button>
                      <Button variant="outlined" onClick={() => LeaveRemove(index)}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button variant="outlined" onClick={() => LeaveEdit(index)}>
                      Edit
                    </Button>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                No available Leave Types.
              </Typography>
            )}
          </Box>
        </Box>

        {/* Nprtrv Section */}
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2', mb: 2 }}>
            New Position, Rate Type & Rate Value
          </Typography>
          <Button variant="contained" color="primary" onClick={OpenAddNprtrv}>
            Add New Position, Rate Type & Rate Value
          </Button>
          <Box
            sx={{
              mt: 1,
              height: '300px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              padding: 2,
            }}
          >
            {nprtrv.length > 0 ? (
              nprtrv.map((Nprtrv, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
                    {Nprtrv.nprtrv_name || Nprtrv.title}
                  </Typography>
                  <TextField
                    value={Nprtrv.nprtrv_value}
                    onChange={(e) => NprtrvValueChange(index, e)}
                    variant="outlined"
                    sx={{
                      mr: 2,
                      '& .MuiInputBase-input.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                    InputProps={{
                      startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                      readOnly: !Nprtrv.editable,
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      style: { color: Nprtrv.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
                    }}
                  />
                  {Nprtrv.editable ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" onClick={() => NprtrvSave(index)}>
                        Save
                      </Button>
                      <Button variant="outlined" onClick={() => NprtrvRemove(index)}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button variant="outlined" onClick={() => NprtrvEdit(index)}>
                      Edit
                    </Button>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                No available Positions, Rate Types, or Rate Values.
              </Typography>
            )}
          </Box>
        </Box>

        {/* Deductions Section */}
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#1976d2' }}>
            Deductions
          </Typography>
          <Button variant="contained" color="primary" onClick={OpenAddDeduc}>
            Add Deductions
          </Button>
          <Box
            sx={{
              mt: 3,
              height: '300px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              padding: 2,
            }}
          >
            {deductions.length > 0 ? (
              deductions.map((deduc, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
                    {deduc.deduc_name || deduc.title}
                  </Typography>
                  <TextField
                    value={deduc.deduc_value}
                    onChange={(e) => DeducValueChange(index, e)}
                    variant="outlined"
                    sx={{
                      mr: 2,
                      '& .MuiInputBase-input.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                    InputProps={{
                      startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                      readOnly: !deduc.editable,
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      style: { color: deduc.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
                    }}
                  />
                  {deduc.editable ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" onClick={() => DeducSave(index)}>
                        Save
                      </Button>
                      <Button variant="outlined" onClick={() => DeducRemove(index)}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button variant="outlined" onClick={() => DeducEdit(index)}>
                      Edit
                    </Button>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
                No deductions available.
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Tax Section */}
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#1976d2' }}>
            Tax
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
              Tax Rate
            </Typography>
            <TextField
              value={tax.tax_value || '0'}
              onChange={TaxChange}
              variant="outlined"
              sx={{
                mr: 2,
                '& .MuiInputBase-input.Mui-disabled': {
                  color: 'rgba(0, 0, 0, 0.6)',
                }, width: '100px'
              }}
              InputProps={{
                endAdornment: <Typography variant="body1" sx={{ mr: 1 }}>%</Typography>,
                readOnly: !tax.editable,
              }}
              inputProps={{
                inputMode: 'numeric',
                style: { color: tax.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
              }}
            />
            {tax.editable ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={saveTax}>
                  Save
                </Button>
              </Box>
            ) : (
              <Button variant="outlined" onClick={editTax}>
                Edit
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* TimeBreak Section */}
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#1976d2' }}>
            Time Break
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
              Time Start
            </Typography>
            <TextField
              value={timeStart.value}
              onChange={TimeStartChange}
              variant="outlined"
              sx={{
                mr: 2,
                '& .MuiInputBase-input.Mui-disabled': {
                  color: 'rgba(0, 0, 0, 0.6)',
                },
                width: '150px',
              }}
              InputProps={{
                readOnly: !timeStart.editable,
              }}
              inputProps={{
                type: 'text', // Change to 'text' to allow time input
                style: { color: timeStart.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' },
              }}
            />
            <Select
              value={dayValue}
              onChange={dayChange}
              autoWidth
              disabled={!isDayEditable}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                marginLeft: -10,
                marginRight: 1
              }}
            >
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="PM">PM</MenuItem>
            </Select>
            {timeStart.editable ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={saveTimeStart}>
                  Save
                </Button>
              </Box>
            ) : (
              <Button variant="outlined" onClick={editTimeStart}>
                Edit
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      <AddDeducModal
        onOpen={deducModal}
        onClose={CloseAddDeduc}
        onAdd={AddDeductions}
        onValue={deducTitle}
        onChange={(e) => setDeducTitle(e.target.value)}
      />
      <AddNprtrvModal
        onOpen={nprtrvModal}
        onClose={CloseNprtrv}
        onAdd={AddNprtrv}
        onValue={nprtrvTitle}
        onChange={(e) => setNprtrvTitle(e.target.value)}
       />
       <AddLeaveModal
        onOpen={leaveModal}
        onClose={CloseLeave}
        onAdd={AddLeave}
        onValue={leaveTitle}
        onChange={(e) => setLeaveTitle(e.target.value)}
       />
       <AddDmbModal
        onOpen={dmbModal}
        onClose={CloseDmb}
        onAdd={AddDmb}
        onValue={dmbTitle}
        onChange={(e) => setDmbTitle(e.target.value)}
       />
    </Box>
  )
}
