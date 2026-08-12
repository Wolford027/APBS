import React from "react"
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined"

import WorkforceMetricCard from "./WorkforceMetricCard"

export default function InactiveEmployeeMetric() {
  return (
    <WorkforceMetricCard
      endpoint="http://localhost:8800/inactive_emp"
      label="Inactive employees"
      description="Outside the active roster"
      icon={PersonOffOutlinedIcon}
      color="warning"
      statusLabel="Inactive"
    />
  )
}
