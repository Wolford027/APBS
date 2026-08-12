import React from "react"
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined"

import WorkforceMetricCard from "./WorkforceMetricCard"

export default function ActiveEmployeeMetric() {
  return (
    <WorkforceMetricCard
      endpoint="http://localhost:8800/count_emp"
      label="Active employees"
      description="Currently in the workforce"
      icon={PeopleAltOutlinedIcon}
      color="success"
      statusLabel="Active"
    />
  )
}
