import React, { useState } from 'react'
import { Box, Button, TextField } from '@mui/material'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import PremiumModal from '../../../shared/components/PremiumModal'
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
        <PremiumModal
            open={onOpen}
            onClose={handleCloseClick}
            title="User Account Configuration"
            subtitle="Verify the security PIN to manage this account's password."
            icon={KeyRoundedIcon}
            maxWidth="xs"
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label='Enter Security Pin'
                    name='security-pin'
                    placeholder='Enter Security Pin'
                    fullWidth
                    value={securityPin}
                    onChange={handlePinChange}
                    type='password'
                />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant='contained' onClick={handleEnterClick}>
                        Enter
                    </Button>
                    <Button
                        variant='outlined'
                        disabled={!isPinCorrect}
                        onClick={handleResetClick}
                    >
                        Reset Password
                    </Button>
                </Box>

                {showPasswordField && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            value={newPassword}
                            onChange={handlePasswordChange}
                        />
                        <Box>
                            <Button variant='contained' onClick={handleSaveClick}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </PremiumModal>
    );
}
