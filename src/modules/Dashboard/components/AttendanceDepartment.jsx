import React, { useEffect, useState } from "react"
import { Chart } from "react-google-charts"
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded"
import axios from "axios"

export const sampleAttendanceData = [
  ["Department", "Present", "Absent"],
  ["Human Resources", 18, 2],
  ["Accounting", 22, 3],
  ["Operations", 31, 5],
  ["Information Technology", 16, 1],
]

export default function AttendanceDepartment() {
  const theme = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingSampleData, setUsingSampleData] = useState(false)

  useEffect(() => {
    let active = true

    axios.get("http://localhost:8800/dept-attendance")
      .then((response) => {
        if (!active) return

        const fetchedData = (response.data || []).map((department) => [
          department.emp_dept,
          Number(department.present_count) || 0,
          Number(department.absent_count) || 0,
        ])
        if (fetchedData.length > 0) {
          setData([["Department", "Present", "Absent"], ...fetchedData])
          setUsingSampleData(false)
        } else {
          setData(sampleAttendanceData)
          setUsingSampleData(true)
        }
      })
      .catch((error) => {
        if (!active) return
        console.error("Error fetching attendance by department:", error)
        setData(sampleAttendanceData)
        setUsingSampleData(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const hasData = data && data.length > 1
  const options = {
    isStacked: true,
    backgroundColor: "transparent",
    chartArea: { left: 105, right: 24, top: 45, bottom: 45, width: "72%", height: "72%" },
    colors: [theme.palette.primary.main, theme.palette.error.main],
    fontName: theme.typography.fontFamily,
    legend: {
      position: "top",
      alignment: "end",
      textStyle: { color: theme.palette.text.secondary, fontSize: 12 },
    },
    hAxis: {
      minValue: 0,
      textStyle: { color: theme.palette.text.secondary, fontSize: 11 },
      gridlines: { color: theme.palette.divider },
      baselineColor: theme.palette.divider,
    },
    vAxis: {
      textStyle: { color: theme.palette.text.secondary, fontSize: 11 },
    },
  }

  return (
    <Card sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flexGrow: 1, display: "flex", flexDirection: "column", "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
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
                bgcolor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.09),
              }}
            >
              <BarChartRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Attendance by department
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present and absent employees across teams
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={usingSampleData ? "Sample data" : "By team"}
            color={usingSampleData ? "warning" : "default"}
            size="small"
            variant="outlined"
            sx={{ display: usingSampleData ? "flex" : { xs: "none", sm: "flex" } }}
          />
        </Stack>

        <Box sx={{ flexGrow: 1, minHeight: { xs: 320, sm: 360 }, display: "flex", alignItems: "center", justifyContent: "center", mt: 1 }}>
          {loading ? (
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Loading attendance insights…
              </Typography>
            </Stack>
          ) : hasData ? (
            <Chart
              chartType="BarChart"
              width="100%"
              height="100%"
              data={data}
              options={options}
            />
          ) : (
            <Box sx={{ textAlign: "center", maxWidth: 300 }}>
              <BarChartRoundedIcon sx={{ fontSize: 42, color: "text.disabled" }} />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                No attendance data yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Department attendance will appear here once records are available.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
