import React from 'react'
import { Box, Typography, Divider, List, ListItem, ListItemText, Menu, IconButton } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

export default function ViewNotificationModal({ anchorEl, onClose, notifications }) {
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 1,
          backgroundColor: 'white',
          width: { xs: '90%', sm: '50%', md: '30%' }, // Adjust size
          maxHeight: '80%',
          boxShadow: 24,
          borderRadius: 2,
          overflowY: 'auto',
        }
      }}
    >
      <Box sx={{ padding: 2 }}>
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
    </Menu>
  )
}
