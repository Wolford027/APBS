import React from 'react'
import { Box, Modal, Typography, Divider, List, ListItem, ListItemText } from '@mui/material'

export default function ViewNotificationModal({onOpen, onClose, notifications}) {

  return (
    <Modal open={onOpen} onClose={onClose} closeAfterTransition BackdropProps={{ style: { backgroundColor: 'transparent' } }}>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', height: '100vh', p: 2}}>
        <Box sx={{
          backgroundColor: 'white',
          padding: 2,
          width: { xs: '90%', sm: '50%', md: '30%' },  // Adjust size to match Facebook's style
          maxHeight: '80%',
          boxShadow: 24,
          borderRadius: 2,
          overflowY: 'auto',
          mt: 4,
          mr: 4, // Positioning closer to the right corner
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#000' }}>
            Notifications
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {notifications.length > 0 ? (
            <List>
              {notifications.map((event, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`${event.l_name} will be end of contract on ${event.dateofend}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No new notifications</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  )
}
