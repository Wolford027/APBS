import React from 'react'
import { Box, Typography, Divider, List, ListItem, ListItemText, Menu } from '@mui/material'
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
          bgcolor: 'background.paper',
          width: { xs: '90%', sm: '50%', md: '30%' }, // Adjust size
          maxHeight: '80%',
          boxShadow: 24,
          borderRadius: 2,
          overflowY: 'auto',
        }
      }}
    >
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 4 }}>
            <NotificationsNoneIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography color="text.secondary">No new notifications</Typography>
          </Box>
        )}
      </Box>
    </Menu>
  )
}
