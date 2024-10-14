import React from 'react'
import { Chart } from 'react-google-charts'
import { Box, Card, CardContent, Typography } from '@mui/material'

export default function AttendanceDepartment() {
  // Data for the chart
  const data = [
    ["Department", "Present", "Absent"],
    ["IT Department", 85, 15],
    ["Finance Department", 79, 21],
    ["Marketing Department", 77, 23],
    ["Sales Department", 68, 32],
  ];

  const options = {
    title: "Attendance per Department",
    isStacked: true,
    legend: { position: "top" },
    hAxis: {
      minValue: 0,
      maxValue: 100,
      format: "#'%'",
      ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    },
    colors: ["#6497b1", "#b3cde0"],
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 1000 }}>
        <CardContent>
          <Typography variant="h4" align="center" color='primary' gutterBottom>
            Attendance per Department
          </Typography>
          <Chart
            chartType="BarChart"
            width="100%"
            height="400px"
            data={data}
            options={options}
          />
        </CardContent>
      </Card>
    </Box>
  );
};
