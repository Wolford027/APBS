import React, { useState } from 'react'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useDialogs } from '@toolpad/core'

export default function ManageAccountModal({ onOpen, onClose }) {
    const { confirm } = useDialogs()
    const [securityPin, setSecurityPin] = useState('')
    const [isPinCorrect, setIsPinCorrect] = useState(false)
    const [showPasswordField, setShowPasswordField] = useState(false)
    const [newPassword, setNewPassword] = useState('')

    const correctPin = '123';

    const handlePinChange = (event) => {
        setSecurityPin(event.target.value)
    }

    const handleEnterClick = () => {
        if (securityPin === correctPin) {
            setIsPinCorrect(true)
        } else {
            alert('Incorrect Pin')
            setIsPinCorrect(false)
        }
    }

    const handleResetClick = () => {
        setShowPasswordField(true)
    }

    const handlePasswordChange = (event) => {
        setNewPassword(event.target.value)
    }

    const handleSaveClick = () => {
        alert(`New password saved: ${newPassword}`)
        resetValues()
    }

    const resetValues = () => {
        setSecurityPin('')
        setIsPinCorrect(false)
        setShowPasswordField(false)
        setNewPassword('')
    }

    const handleCloseClick = async () => {
        const confirmed = await confirm('Are you sure you want to close?')
        if (confirmed) {
            resetValues()
            onClose()
        }
    }

    return (
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
                }}>
                    <CloseIcon onClick={handleCloseClick} sx={{ cursor: 'pointer', marginLeft: 80 }} />
                    <Box sx={{ justifyContent: 'center' }}>
                        <Typography variant='h4'>User Account Configuration</Typography>
                        <Box>
                            <Typography sx={{ marginTop: 3 }}>Security Pin</Typography>
                            <TextField
                                sx={{ marginTop: 1 }}
                                label='Enter Security Pin'
                                name='security-pin'
                                placeholder='Enter Security Pin'
                                fullWidth
                                value={securityPin}
                                onChange={handlePinChange}
                                type='password'
                            />
                            <Button
                                variant='contained'
                                sx={{ marginTop: 2 }}
                                onClick={handleEnterClick}
                            >
                                Enter
                            </Button>
                        </Box>
                        
                        <Button
                            variant='contained'
                            sx={{ marginTop: 3 }}
                            disabled={!isPinCorrect}
                            onClick={handleResetClick}
                        >
                            Reset Password
                        </Button>

                        {showPasswordField && (
                            <Box sx={{ marginTop: 3 }}>
                                <TextField
                                    label="New Password"
                                    type="password"
                                    fullWidth
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                />
                                <Button
                                    variant='contained'
                                    sx={{ marginTop: 2 }}
                                    onClick={handleSaveClick}
                                >
                                    Save
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
