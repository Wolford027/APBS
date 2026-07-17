import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import axios from 'axios';

export default function AttendanceDepartment() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8800/dept-attendance')
      .then(response => {
        const fetchedData = (response.data || []).map(dept => [
          dept.emp_dept, Number(dept.present_count) || 0, Number(dept.absent_count) || 0,
        ]);
        setData([["Department", "Present", "Absent"], ...fetchedData]);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setData([["Department", "Present", "Absent"]]);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasData = data && data.length > 1;

  const options = {
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
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
      <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <BarChartIcon color="primary" fontSize="small" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Attendance per Department
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <CircularProgress size={32} />
            ) : hasData ? (
              <Chart
                chartType="BarChart"
                width="100%"
                height="100%"
                data={data}
                options={options}
              />
            ) : (
              <Typography color="text.secondary">No attendance data available yet.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
