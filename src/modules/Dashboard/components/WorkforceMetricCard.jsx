import React, { useEffect, useState } from "react"
import axios from "axios"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { alpha } from "@mui/material/styles"

import { durations, ease } from "../../../shared/animations"

export default function WorkforceMetricCard({
  endpoint,
  label,
  description,
  icon: MetricIcon,
  color = "primary",
  statusLabel = "Live",
}) {
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    let active = true

    axios.get(endpoint)
      .then((response) => {
        if (!active) return

        if (response.data && response.data.length > 0) {
          setValue(Number(response.data[0].count) || 0)
        } else {
          setHasError(true)
        }
      })
      .catch((error) => {
        if (!active) return
        console.error(`Error fetching ${label.toLowerCase()}:`, error)
        setHasError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [endpoint, label])

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: "easeOut" })
    return () => controls.stop()
  }, [count, value])

  return (
    <Card
      component={motion.article}
      whileHover={{ y: -3 }}
      transition={{ duration: durations.micro, ease }}
      sx={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 auto 0 0",
          width: 4,
          bgcolor: `${color}.main`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={72} height={48} sx={{ mt: 0.25 }} />
            ) : (
              <Typography variant="h3" sx={{ mt: 0.5, fontSize: 34, letterSpacing: "-0.03em" }}>
                <motion.span>{rounded}</motion.span>
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 2.25,
              display: "grid",
              placeItems: "center",
              color: `${color}.main`,
              bgcolor: (theme) => alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
            }}
          >
            <MetricIcon />
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {hasError ? "Data currently unavailable" : description}
          </Typography>
          <Chip
            label={hasError ? "Unavailable" : statusLabel}
            size="small"
            color={hasError ? "default" : color}
            variant="outlined"
            sx={{ height: 24, flexShrink: 0, "& .MuiChip-label": { px: 1, fontSize: 11 } }}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
