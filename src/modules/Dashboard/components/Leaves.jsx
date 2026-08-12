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
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded"
import axios from "axios"

export const options = {
  pieHole: 0,
  is3D: false,
  pieSliceText: "value",
  chartArea: { width: "90%", height: "78%" },
  legend: { position: "bottom", maxLines: 2 },
}

export const sampleLeaveData = [
  ["Type", "Leave Days"],
  ["Vacation leave", 18],
  ["Sick leave", 12],
  ["Emergency leave", 7],
  ["Maternity / paternity", 5],
]

export default function Leaves() {
  const theme = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingSampleData, setUsingSampleData] = useState(false)

  useEffect(() => {
    let active = true

    axios.get("http://localhost:8800/leave-type-distribution")
      .then((response) => {
        if (!active) return

        const rows = (response.data || []).map((row) => [
          row.leave_type_name,
          Number(row.total_days) || 0,
        ])
        if (rows.length > 0) {
          setData([["Type", "Leave Days"], ...rows])
          setUsingSampleData(false)
        } else {
          setData(sampleLeaveData)
          setUsingSampleData(true)
        }
      })
      .catch((error) => {
        if (!active) return
        console.error("Error fetching leave type distribution:", error)
        setData(sampleLeaveData)
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
  const chartOptions = {
    ...options,
    backgroundColor: "transparent",
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.primary.light,
    ],
    fontName: theme.typography.fontFamily,
    legend: {
      ...options.legend,
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
                color: "secondary.main",
                bgcolor: (currentTheme) => alpha(currentTheme.palette.secondary.main, 0.1),
              }}
            >
              <DonutLargeRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Leave type distribution
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved leave days grouped by category
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={usingSampleData ? "Sample data" : "Leave mix"}
            color={usingSampleData ? "warning" : "default"}
            size="small"
            variant="outlined"
            sx={{ display: usingSampleData ? "flex" : { xs: "none", sm: "flex" } }}
          />
        </Stack>

        <Box sx={{ flexGrow: 1, minHeight: { xs: 320, sm: 360 }, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", mt: 1 }}>
          {loading ? (
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Loading leave insights…
              </Typography>
            </Stack>
          ) : hasData ? (
            <Chart
              chartType="PieChart"
              data={data}
              options={chartOptions}
              width="100%"
              height="100%"
            />
          ) : (
            <Box sx={{ textAlign: "center", maxWidth: 300 }}>
              <DonutLargeRoundedIcon sx={{ fontSize: 42, color: "text.disabled" }} />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                No leave data yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Leave distribution will appear here once approved records are available.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
