import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Chart } from "react-google-charts";

export const data = [
  ["Type", "Leave per Day"],
  ["Sick Leave", 11],
  ["Casual Leave", 2],
  ["Compensatory Leave", 12],
  ["Paternity Leave", 5],
  ["Maternity Leave", 5],
];

export const options = {
  title: "Leave Type Distribution",
  pieHole: 0.4,  // Slight donut effect for clarity
  is3D: true,
  chartArea: { width: '90%', height: '80%' },  // Adjusts the chart area for better use of space
  legend: { position: 'bottom' },  // Places the legend at the bottom for a cleaner layout
};

export default function Leaves() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'start'}}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            <strong>Leave Type Distribution</strong>
          </Typography>
          <Chart
            chartType="PieChart"
            data={data}
            options={options}
            width={"100%"}
            height={"300px"}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
