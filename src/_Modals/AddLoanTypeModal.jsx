import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'


export default function AddLoanTypeModal({onOpen, onClose, onAdd, onChange, onValue}) {
  return (
    <Dialog open={onOpen} onClose={onClose}>
        <DialogTitle>Add New Loan Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Loan Type Title"
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
