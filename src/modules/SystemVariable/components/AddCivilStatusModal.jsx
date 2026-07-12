import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'


export default function AddCivilStatusModal({onOpen, onClose, onAdd, onChange, onValue}) {
  return (
    <Dialog open={onOpen} onClose={onClose}>
        <DialogTitle>Add New Civil Status</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Civil Status Title"
            fullWidth
            variant="outlined"
            value={onValue}
            onChange={onChange}
          />
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
