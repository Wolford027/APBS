import React from "react"
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"

import WorkforceMetricCard from "./WorkforceMetricCard"

export default function TotalEmployeeMetric() {
  return (
    <WorkforceMetricCard
      endpoint="http://localhost:8800/count_emp"
      label="Total employees"
      description="All registered employees"
      icon={GroupsOutlinedIcon}
      color="primary"
      statusLabel="Workforce"
    />
  )
}
