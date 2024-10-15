import React,{ useState } from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useDialogs } from '@toolpad/core'
import axios from 'axios'

export default function FileEmployeeLeave({onOpen, onClose, emp_Info, selectedEmployee}) {


  return (
    <>
        <Modal open={onOpen} onClose={onClose} closeAfterTransition>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2}}>
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 4,
                    width: {xs: '80%', sm: '60%', md: '50%'},
                    height: {xs: '80%', sm: '60%', md: '70%'},
                    boxShadow: 24,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    overflowY: 'auto'}}
                >
                    <Typography variant='h4' sx={{marginBottom: 2}}>File Employee Leave</Typography>
                    <Box sx={{marginTop: 2, overscrollBehavior: 'contain'}}>

                        <Box sx={{marginBottom: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            
                        </Box>

                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <TextField label='Surname' inputProps={{readOnly: true}} sx={{width: '30%', marginLeft: 1}}  />
                            <TextField label='First Name' inputProps={{readOnly: true}} sx={{width: '30%', marginLeft: 1}} />
                            <TextField label='Middle Name' inputProps={{readOnly: true}} sx={{width: '25%', marginLeft: 1}} />
                            <TextField label='Suffix' inputProps={{readOnly: true}} sx={{width: '16%', marginLeft: 1}}  />
                        </Box>
                        
                        
                    </Box>
                </Box>
            </Box>
        </Modal>
    </>
  )
}
