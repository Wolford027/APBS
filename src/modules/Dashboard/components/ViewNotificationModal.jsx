import React from "react"
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Stack,
  Typography,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined"

function formatContractDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value || "Date unavailable"

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function ViewNotificationModal({ anchorEl, onClose, notifications }) {
  const open = Boolean(anchorEl)

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      MenuListProps={{ "aria-labelledby": "contract-notifications-title", sx: { p: 0 } }}
      PaperProps={{
        sx: {
          mt: 1,
          width: { xs: "calc(100vw - 32px)", sm: 390 },
          maxWidth: 390,
          maxHeight: "min(560px, calc(100vh - 96px))",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.16)",
          borderRadius: 2.5,
          overflowY: "auto",
        },
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography id="contract-notifications-title" variant="subtitle1" sx={{ fontWeight: 700 }}>
              Contract alerts
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Employee contracts ending within 14 days
            </Typography>
          </Box>
          <Chip label={notifications.length} size="small" color={notifications.length ? "error" : "default"} />
        </Stack>
      </Box>
      <Divider />

      {notifications.length > 0 ? (
        <List disablePadding aria-label="Upcoming employee contract endings">
          {notifications.map((event, index) => {
            const employeeName = [event.f_name, event.l_name].filter(Boolean).join(" ") || event.l_name || "Employee"

            return (
              <ListItem key={event.id || event.emp_id || `${employeeName}-${index}`} divider alignItems="flex-start" sx={{ px: 2.25, py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 42, pt: 0.25 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.5,
                      color: "error.main",
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.09),
                    }}
                  >
                    <WorkHistoryOutlinedIcon fontSize="small" />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={employeeName}
                  secondary={`Contract ends ${formatContractDate(event.dateofend)}`}
                  primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                  secondaryTypographyProps={{ variant: "caption", sx: { mt: 0.25 } }}
                />
              </ListItem>
            )
          })}
        </List>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1, px: 3, py: 5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              color: "text.secondary",
              bgcolor: "action.hover",
            }}
          >
            <NotificationsNoneIcon />
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
            You’re all caught up
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No employee contracts are ending in the next 14 days.
          </Typography>
        </Box>
      )}
    </Menu>
  )
}
