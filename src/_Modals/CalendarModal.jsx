import React, { useState, useEffect}  from 'react'
import { Box, Modal, Typography } from '@mui/material'
import axios from 'axios'

export default function CalendarModal({onOpen, onClose, setEvents}) {
    const [event, setEvent] = useState([])  // Default to an empty array

    const FetchEvent = async () => {
        try {
            const res = await axios.get('http://localhost:8800/event');
            console.log(res.data);
            setEvent(res.data);  // Set event to the result array
            setEvents(res.data);
        } catch (err) {
            console.log(err);
        }
    }
    
    useEffect(() => {
        if (onOpen) {
            FetchEvent();
        }
    }, [onOpen])
  
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
                        overflowY: 'auto'
                    }}>
                        <Typography>
                            Events
                        </Typography>
                        <Box>
                            {Array.isArray(event) && event.map((ev, index) => (
                                <Typography key={index}>
                                    Hired: {ev.dateofhired}, End: {ev.dateofend}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}
