import React, { useEffect, useState } from "react"
import { Calendar as RsuiteCalendar } from "rsuite"
import "rsuite/dist/rsuite.min.css"
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined"
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined"
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined"
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined"
import axios from "axios"

import "./badge.css"

const fetchHolidays = async (year) => {
  const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`)

  return (response.data || []).map((holiday) => ({
    date: new Date(holiday.date),
    title: holiday.localName || holiday.name,
  }))
}

const fetchEndDates = async () => {
  const response = await axios.get("http://localhost:8800/end-date")

  if (!Array.isArray(response.data)) {
    throw new Error("Expected employee contract dates to be an array")
  }

  return response.data.map((employee) => {
    const date = new Date(employee.emp_dateend)
    date.setHours(0, 0, 0, 0)

    return {
      date,
      name: `${employee.l_name}, ${employee.f_name} ${employee.m_name ? `${employee.m_name.charAt(0)}.` : ""}`.trim(),
    }
  })
}

export default function MiniCalendar({ selectRange }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [holidays, setHolidays] = useState([])
  const [endDates, setEndDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadWarning, setLoadWarning] = useState("")

  useEffect(() => {
    let active = true

    const loadCalendarData = async () => {
      const year = new Date().getFullYear()
      const [holidayResult, endDateResult] = await Promise.allSettled([
        fetchHolidays(year),
        fetchEndDates(),
      ])

      if (!active) return

      if (holidayResult.status === "fulfilled") {
        setHolidays(holidayResult.value)
      }

      if (endDateResult.status === "fulfilled") {
        setEndDates(endDateResult.value)
      }

      if (holidayResult.status === "rejected" || endDateResult.status === "rejected") {
        setLoadWarning("Some calendar events could not be loaded. Available events are still shown.")
      }

      setLoading(false)
    }

    loadCalendarData()

    return () => {
      active = false
    }
  }, [])

  const renderCell = (date) => {
    const hasHoliday = holidays.some(
      (holiday) => holiday.date.toDateString() === date.toDateString()
    )
    const hasEndDate = endDates.some(
      (endDate) => endDate.date.toDateString() === date.toDateString()
    )

    return (
      <div className="custom-badge-container" aria-hidden="true">
        {hasHoliday && <span className="holiday-dot" />}
        {hasEndDate && <span className="termination-dot" />}
      </div>
    )
  }

  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: 2.25,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
              }}
            >
              <CalendarMonthOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Calendar &amp; events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Holidays and upcoming employee contract milestones
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" aria-label="Calendar legend">
            <Chip
              size="small"
              label="Holiday"
              icon={<Box component="span" className="legend-dot holiday-dot" />}
              variant="outlined"
            />
            <Chip
              size="small"
              label="Contract end"
              icon={<Box component="span" className="legend-dot termination-dot" />}
              variant="outlined"
            />
          </Stack>
        </Stack>

        {loadWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {loadWarning}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(320px, 0.95fr) minmax(260px, 1.05fr)" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <Paper
            variant="outlined"
            className="dashboard-calendar"
            sx={{
              minWidth: 0,
              overflow: "hidden",
              "& .rs-calendar": { width: "100%" },
              "& .rs-calendar-header": { px: 1 },
            }}
          >
            <RsuiteCalendar
              onChange={setSelectedDate}
              value={selectedDate}
              selectRange={selectRange}
              compact
              renderCell={renderCell}
              style={{ width: "100%" }}
            />
          </Paper>

          {loading ? (
            <Paper variant="outlined" sx={{ p: 2.5, minHeight: 290 }}>
              <Skeleton variant="text" width="45%" height={34} />
              <Skeleton variant="text" width="70%" />
              <Divider sx={{ my: 2 }} />
              <Skeleton variant="rounded" height={64} sx={{ mb: 1.5 }} />
              <Skeleton variant="rounded" height={64} />
            </Paper>
          ) : (
            <EventList date={selectedDate} holidays={holidays} endDates={endDates} />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

function EventList({ date, holidays, endDates }) {
  if (!date) {
    return (
      <Paper
        variant="outlined"
        sx={{
          minHeight: 290,
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.015),
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            color: "primary.main",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.09),
          }}
        >
          <EventAvailableOutlinedIcon />
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 700 }}>
          Select a date
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 280 }}>
          Choose a calendar day to review holidays and employee contract endings.
        </Typography>
      </Paper>
    )
  }

  const holidayList = holidays.filter(
    (holiday) => holiday.date.toDateString() === date.toDateString()
  )
  const endDateList = endDates.filter(
    (endDate) => endDate.date.toDateString() === date.toDateString()
  )
  const hasEvents = holidayList.length > 0 || endDateList.length > 0
  const formattedDate = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)

  return (
    <Paper variant="outlined" sx={{ minHeight: 290, p: 2.5 }}>
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>
        Selected date
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.25 }}>
        {formattedDate}
      </Typography>
      <Divider sx={{ my: 2 }} />

      {hasEvents ? (
        <List disablePadding aria-label={`Events for ${formattedDate}`}>
          {holidayList.map((item) => (
            <ListItem key={`holiday-${item.title}`} disableGutters alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 42, color: "primary.main", pt: 0.5 }}>
                <CelebrationOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary="Public holiday"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
          ))}
          {endDateList.map((item) => (
            <ListItem key={`contract-${item.name}`} disableGutters alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 42, color: "error.main", pt: 0.5 }}>
                <WorkHistoryOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                secondary="Employee contract end date"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <EventBusyOutlinedIcon sx={{ color: "text.disabled", fontSize: 40 }} />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            No events on this day
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            There are no holidays or contract endings scheduled.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
