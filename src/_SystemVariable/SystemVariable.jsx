import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { Button, TextField } from '@mui/material'
import AddDeducModal from '../_Modals/AddDeducModal'

const drawerWidth = 240

export default function SystemVariable() {
  const [deductions, setDeductions] = useState(() => {
    // Get deductions from localStorage on initial load
    const storedDeductions = localStorage.getItem('deductions')
    return storedDeductions ? JSON.parse(storedDeductions) : []
  })
  const [deducTitle, setDeducTitle] = useState('')
  const [deducModal, setDeducModal] = useState(false)
  const [tax, setTax] = useState(() => {
    // Get tax from localStorage on initial load
    const storedTax = localStorage.getItem('tax')
    return storedTax ? JSON.parse(storedTax) : { value: '', editable: true }
  })

  // Save deductions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deductions', JSON.stringify(deductions))
  }, [deductions])

  // Save tax to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tax', JSON.stringify(tax))
  }, [tax])

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

  const DeducSave = (index) => {
    const newDeduc = deductions.map((deduc, i) =>
      i === index ? { ...deduc, editable: false } : deduc
    )
    setDeductions(newDeduc)
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

  const saveTax = () => {
    setTax({ ...tax, editable: false })
  }

  const editTax = () => {
    setTax({ ...tax, editable: true })
  }

  const removeTax = () => {
    setTax({ value: '', editable: true })
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
            {deductions.map((deduc, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
                  {deduc.title}
                </Typography>
                <TextField
                  value={deduc.value}
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
            ))}
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
              value={tax.value}
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
                <Button variant="outlined" onClick={removeTax}>
                  Remove
                </Button>
              </Box>
            ) : (
              <Button variant="outlined" onClick={editTax}>
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
    </Box>
  )
}
