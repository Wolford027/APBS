import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { Box, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';

export default function AttendanceDepartment() {
  const [data, setData] = useState([["Department", "Present", "Absent"]]);

  useEffect(() => {
    axios.get('http://localhost:8800/dept-attendance')
      .then(response => {
        const fetchedData = response.data.map(dept => [
          dept.emp_dept, dept.present_count, dept.absent_count
        ]);
        setData([["Department", "Present", "Absent"], ...fetchedData]);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

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
    colors: ["#6497b1", "#C10C04"],
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
