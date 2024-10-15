import React, { useState } from 'react'
import { Box, Modal, TextField, Autocomplete, Typography, Button, Grid } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useDialogs } from '@toolpad/core'
import axios from 'axios'
import SearchBar from "../Components/SearchBar";

export default function AddEmployeeLeave({ onOpen, onClose, emp_Info, selectedEmployee }) {


    return (
        <>
            <Modal open={onOpen} onClose={onClose} closeAfterTransition>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                    <Box sx={{
                        backgroundColor: 'white',
                        padding: 4,
                        width: { xs: '80%', sm: '60%', md: '50%' },
                        height: { xs: '80%', sm: '60%', md: '70%' },
                        boxShadow: 24,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflow: 'hidden',
                        overflowY: 'auto'
                    }}
                    >
                        <Typography variant='h4' sx={{ marginBottom: 2 }}>Add Employee Leave</Typography>
                        <Box sx={{ marginTop: 0, overscrollBehavior: 'contain' }}>


                            <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "Flex-start", alignItems: "center", }} >
                                <Grid size={4} sx={{ marginLeft: -5 }}>

                                    <Autocomplete
                                        spacing={0}
                                        sx={{ width: 210, marginBottom: 2, marginLeft: 5 }}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select Employee ID" />
                                        )} />

                                </Grid>
                                <Grid size={4} sx={{ marginLeft: -3 }}>

                                    <Autocomplete
                                        spacing={0}
                                        sx={{ width: 250, marginBottom: 2, marginLeft: 5 }}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select Employee Name" />
                                        )} />

                                </Grid>

                            </Grid>

                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}
