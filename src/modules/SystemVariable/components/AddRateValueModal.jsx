import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, InputAdornment } from '@mui/material'


export default function AddRateValueModal({onOpen, onClose, onAdd, onChange, onValue}) {
  const position = typeof onValue === 'object' ? onValue.position : onValue;
  const value = typeof onValue === 'object' ? onValue.value : '';

  return (
    <Dialog open={onOpen} onClose={onClose}>
        <DialogTitle>Add Position and Rate Value</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: { xs: 260, sm: 380 } }}>
            <TextField
              autoFocus
              label="Position"
              fullWidth
              variant="outlined"
              value={position || ''}
              onChange={(event) => onChange('position', event.target.value)}
            />
            <TextField
              label="Rate Value"
              fullWidth
              variant="outlined"
              value={value || ''}
              onChange={(event) => onChange('value', event.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
              inputProps={{ inputMode: 'decimal' }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={onAdd} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
  )
}
