import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Chart } from "react-google-charts";

export const data = [
  ["Task", "Hours per Day"],
  ["Office", 11],
  ["Home", 2],
];

export const options = {
  title: "My Daily Activities",
  pieHole: 0.4,
  is3D: true,
  chartArea: { width: '90%', height: '80%' },
  legend: { position: 'bottom' },
};

export default function DataWork() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'start', mt: 4, marginLeft: -70 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            <strong>Employee Work Location Breakdown</strong>
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
