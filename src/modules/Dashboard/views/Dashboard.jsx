import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "motion/react"
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined"
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined"
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"

import PageLayout from "../../../shared/components/PageLayout"
import { staggerContainer, staggerItem } from "../../../shared/animations"
import { useAuth } from "../../Auth/hooks/AuthContext"
import AttendanceDepartment from "../components/AttendanceDepartment"
import Calendar from "../components/Calendar"
import Leaves from "../components/Leaves"
import MiniStatisticsA from "../components/MiniStatisticsA"
import MiniStatisticsI from "../components/MiniStatisticsI"
import MiniStatisticsT from "../components/MiniStatisticsT"
import ViewNotificationModal from "../components/ViewNotificationModal"

const QUICK_ACTIONS = [
  {
    label: "Employee records",
    description: "View and manage your people",
    to: "/employee-list",
    roles: ["Admin", "HR"],
    icon: GroupsOutlinedIcon,
  },
  {
    label: "Attendance",
    description: "Review time and attendance",
    to: "/employee-attendance",
    roles: ["Admin", "HR"],
    icon: FactCheckOutlinedIcon,
  },
  {
    label: "Leave requests",
    description: "Manage employee leave",
    to: "/employee-leave",
    roles: ["Admin", "HR"],
    icon: EventAvailableOutlinedIcon,
  },
  {
    label: "Payroll runs",
    description: "Open payroll processing",
    to: "/payroll",
    roles: ["Admin", "Accountant"],
    icon: PaymentsOutlinedIcon,
  },
  {
    label: "Payslips",
    description: "Review generated payslips",
    to: "/payslip",
    roles: ["Admin", "Accountant"],
    icon: ReceiptLongOutlinedIcon,
  },
  {
    label: "Employee reports",
    description: "Open workforce reporting",
    to: "/employee-report",
    roles: ["Admin", "HR"],
    icon: AssessmentOutlinedIcon,
  },
  {
    label: "Payroll reports",
    description: "Review payroll reporting",
    to: "/payroll-report",
    roles: ["Admin", "Accountant"],
    icon: AssessmentOutlinedIcon,
  },
]

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, role, username } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [events, setEvents] = useState([])
  const [notifications, setNotifications] = useState([])

  const availableActions = useMemo(
    () => QUICK_ACTIONS.filter((action) => !role || action.roles.includes(role)).slice(0, 4),
    [role]
  )

  const today = useMemo(
    () => new Intl.DateTimeFormat("en-PH", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date()),
    []
  )

  const displayName = username || role || "there"

  const handleOpenNotification = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseNotification = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8800/event")
        setEvents(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error("Error fetching contract notifications:", err)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    const todayDate = new Date()
    const upcomingNotifications = events.filter((event) => {
      const terminationDate = new Date(event.dateofend)
      const differenceInDays = Math.abs(todayDate - terminationDate) / (1000 * 3600 * 24)
      return differenceInDays <= 14
    })

    setNotifications(upcomingNotifications)
  }, [events])

  return (
    <PageLayout
      title="Dashboard"
      actions={
        <Tooltip title="Contract notifications">
          <IconButton color="inherit" aria-label="View notifications" onClick={handleOpenNotification}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      }
    >
      <Box
        component={motion.section}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        aria-labelledby="dashboard-welcome-title"
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: { xs: 2.5, md: 3.5 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(125deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 55%, ${theme.palette.background.paper} 100%)`,
          "&::after": {
            content: '""',
            position: "absolute",
            width: 220,
            height: 220,
            right: -90,
            top: -110,
            borderRadius: "50%",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
          },
        }}
      >
        <Grid container spacing={3} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
          <Grid item xs={12} md={8} component={motion.div} variants={staggerItem}>
            <Chip
              label="People operations workspace"
              size="small"
              color="primary"
              sx={{ mb: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
            />
            <Typography
              id="dashboard-welcome-title"
              variant="h4"
              sx={{ fontSize: { xs: 26, md: 32 }, letterSpacing: "-0.025em", mb: 1 }}
            >
              {getGreeting()}, {displayName}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 650, lineHeight: 1.7 }}>
              Track your workforce, attendance, leave activity, and upcoming contract milestones from one place.
            </Typography>
            <Box sx={{ mt: 2.5 }}>
              {availableActions[0] && (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => navigate(availableActions[0].to)}
                >
                  {availableActions[0].label}
                </Button>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={4} component={motion.div} variants={staggerItem}>
            <Box
              sx={{
                ml: { md: "auto" },
                maxWidth: { md: 290 },
                p: 2,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.16),
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.82),
                backdropFilter: "blur(8px)",
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>
                Today
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.25 }}>
                {today}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Your latest workforce activity and calendar are ready below.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box component="section" aria-labelledby="workforce-snapshot-title">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={0.5}
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography id="workforce-snapshot-title" variant="h6" sx={{ fontWeight: 700 }}>
              Workforce snapshot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current employee status across your organization
            </Typography>
          </Box>
          <Chip label="Live overview" size="small" variant="outlined" color="primary" />
        </Stack>

        <Grid
          container
          spacing={2.5}
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid item xs={12} sm={6} md={4} component={motion.div} variants={staggerItem}>
            <MiniStatisticsA />
          </Grid>
          <Grid item xs={12} sm={6} md={4} component={motion.div} variants={staggerItem}>
            <MiniStatisticsI />
          </Grid>
          <Grid item xs={12} sm={6} md={4} component={motion.div} variants={staggerItem}>
            <MiniStatisticsT />
          </Grid>
        </Grid>
      </Box>

      <Grid
        container
        spacing={2.5}
        component={motion.div}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        sx={{ mt: 0.5 }}
      >
        <Grid item xs={12} lg={8} component={motion.div} variants={staggerItem}>
          <Calendar />
        </Grid>
        <Grid item xs={12} lg={4} component={motion.div} variants={staggerItem}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Quick actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Jump back into your most-used workflows
              </Typography>
              <Stack spacing={1}>
                {availableActions.map(({ label, description, to, icon: ActionIcon }) => (
                  <Button
                    key={to}
                    variant="text"
                    onClick={() => navigate(to)}
                    aria-label={`${label}: ${description}`}
                    sx={{
                      justifyContent: "flex-start",
                      gap: 1.5,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      color: "text.primary",
                      textAlign: "left",
                      "&:hover": {
                        borderColor: "primary.light",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 2,
                        color: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
                      }}
                    >
                      <ActionIcon fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {description}
                      </Typography>
                    </Box>
                    <ArrowForwardRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box component="section" aria-labelledby="workforce-insights-title" sx={{ mt: 3 }}>
        <Typography id="workforce-insights-title" variant="h6" sx={{ fontWeight: 700 }}>
          Workforce insights
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
          Attendance and leave trends from your current records
        </Typography>
        <Grid
          container
          spacing={2.5}
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid item xs={12} lg={7} component={motion.div} variants={staggerItem}>
            <AttendanceDepartment />
          </Grid>
          <Grid item xs={12} lg={5} component={motion.div} variants={staggerItem}>
            <Leaves />
          </Grid>
        </Grid>
      </Box>

      <ViewNotificationModal
        anchorEl={anchorEl}
        onClose={handleCloseNotification}
        notifications={notifications}
      />
    </PageLayout>
  )
}
