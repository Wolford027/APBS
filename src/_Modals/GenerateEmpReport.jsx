import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'

export default function GenerateEmpReport({onOpen, onClose}) {
  return (
    <Dialog open={onOpen} onClose={onClose}>
        <DialogTitle>Generate Employee Report</DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">
                Cancel
            </Button>
            <Button onClick={onClose} color="primary">
                Generate Report
            </Button>
        </DialogActions>
    </Dialog>
  )
}
