import React,{ useState, useEffect } from 'react'
import { Box, Modal } from '@mui/material'

export default function UploadAttendanceModal({onOpen, onClose}) {
    const [excelFile, setExcelFile] = useState(null)
    const [typeError, setTypeError] = useState(null)
    const [excelData, setExcelData] = useState(null)
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
                    overflowY: 'auto' }}
                >
                    
                </Box>
            </Box>
        </Modal>
    </>
  )
}
