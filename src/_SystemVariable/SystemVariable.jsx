import React, { useState } from 'react';
import SideNav from '../Components/SideNav';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const drawerWidth = 240;

export default function SystemVariable() {
  const [benefits, setBenefits] = useState([]);
  const [newBenefitTitle, setNewBenefitTitle] = useState('');
  const [taxes, setTaxes] = useState([]);
  const [newTaxTitle, setNewTaxTitle] = useState('');
  
  const [benefitModalOpen, setBenefitModalOpen] = useState(false);
  const [taxModalOpen, setTaxModalOpen] = useState(false);

  const handleOpenBenefitModal = () => setBenefitModalOpen(true);
  const handleCloseBenefitModal = () => {
    setNewBenefitTitle('');
    setBenefitModalOpen(false);
  };

  const handleOpenTaxModal = () => setTaxModalOpen(true);
  const handleCloseTaxModal = () => {
    setNewTaxTitle('');
    setTaxModalOpen(false);
  };

  const handleAddBenefit = () => {
    if (newBenefitTitle.trim()) {
      setBenefits([...benefits, { title: newBenefitTitle, value: '', editable: true }]);
      setNewBenefitTitle('');
      setBenefitModalOpen(false);
    }
  };

  const handleAddTax = () => {
    if (newTaxTitle.trim()) {
      setTaxes([...taxes, { title: newTaxTitle, value: '', editable: true }]);
      setNewTaxTitle('');
      setTaxModalOpen(false);
    }
  };

  const handleBenefitValueChange = (index, event) => {
    const newValue = event.target.value.replace(/\D/, ''); // Remove non-digit characters
    const newBenefits = benefits.map((benefit, i) =>
      i === index ? { ...benefit, value: newValue } : benefit
    );
    setBenefits(newBenefits);
  };

  const handleTaxValueChange = (index, event) => {
    const newValue = event.target.value.replace(/\D/, ''); // Remove non-digit characters
    const newTaxes = taxes.map((tax, i) =>
      i === index ? { ...tax, value: newValue } : tax
    );
    setTaxes(newTaxes);
  };

  const handleBenefitSave = (index) => {
    const newBenefits = benefits.map((benefit, i) =>
      i === index ? { ...benefit, editable: false } : benefit
    );
    setBenefits(newBenefits);
  };

  const handleBenefitEdit = (index) => {
    const newBenefits = benefits.map((benefit, i) =>
      i === index ? { ...benefit, editable: true } : benefit
    );
    setBenefits(newBenefits);
  };

  const handleTaxSave = (index) => {
    const newTaxes = taxes.map((tax, i) =>
      i === index ? { ...tax, editable: false } : tax
    );
    setTaxes(newTaxes);
  };

  const handleTaxEdit = (index) => {
    const newTaxes = taxes.map((tax, i) =>
      i === index ? { ...tax, editable: true } : tax
    );
    setTaxes(newTaxes);
  };

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
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Benefits
        </Typography>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Button variant="outlined" onClick={handleOpenBenefitModal}>
            Add Benefit
          </Button>
        </Box>
        <Box>
          {benefits.map((benefit, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
                {benefit.title}
              </Typography>
              <TextField
                value={benefit.value}
                onChange={(e) => handleBenefitValueChange(index, e)}
                variant="outlined"
                sx={{
                  mr: 2,
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.6)',
                  },
                }}
                InputProps={{
                  startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                  readOnly: !benefit.editable,
                }}
                inputProps={{
                  inputMode: 'numeric',
                  style: { color: benefit.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' }
                }}
              />
              {benefit.editable ? (
                <Button variant="outlined" onClick={() => handleBenefitSave(index)}>
                  Save
                </Button>
              ) : (
                <Button variant="outlined" onClick={() => handleBenefitEdit(index)}>
                  Edit
                </Button>
              )}
            </Box>
          ))}
        </Box>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Taxes & Deductions
        </Typography>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Button variant="outlined" onClick={handleOpenTaxModal}>
            Add Tax/Deduction
          </Button>
        </Box>
        <Box>
          {taxes.map((tax, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2, width: '80px' }}>
                {tax.title}
              </Typography>
              <TextField
                value={tax.value}
                onChange={(e) => handleTaxValueChange(index, e)}
                variant="outlined"
                sx={{
                  mr: 2,
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.6)',
                  },
                }}
                InputProps={{
                  startAdornment: <Typography variant="body1" sx={{ mr: 1 }}>₱</Typography>,
                  readOnly: !tax.editable,
                }}
                inputProps={{
                  inputMode: 'numeric',
                  style: { color: tax.editable ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.6)' }
                }}
              />
              {tax.editable ? (
                <Button variant="outlined" onClick={() => handleTaxSave(index)}>
                  Save
                </Button>
              ) : (
                <Button variant="outlined" onClick={() => handleTaxEdit(index)}>
                  Edit
                </Button>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Adding Benefit */}
      <Dialog open={benefitModalOpen} onClose={handleCloseBenefitModal}>
        <DialogTitle>Add New Benefit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Benefit Title"
            fullWidth
            variant="outlined"
            value={newBenefitTitle}
            onChange={(e) => setNewBenefitTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBenefitModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddBenefit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adding Tax/Deduction */}
      <Dialog open={taxModalOpen} onClose={handleCloseTaxModal}>
        <DialogTitle>Add New Tax/Deduction</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tax/Deduction Title"
            fullWidth
            variant="outlined"
            value={newTaxTitle}
            onChange={(e) => setNewTaxTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaxModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddTax} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
