import * as React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PieChartIcon from '@mui/icons-material/PieChart';
import { Chart } from "react-google-charts";
import axios from 'axios';

export const options = {
  pieHole: 0.4,  // Slight donut effect for clarity
  is3D: false,
  chartArea: { width: '90%', height: '80%' },  // Adjusts the chart area for better use of space
  legend: { position: 'bottom' },  // Places the legend at the bottom for a cleaner layout
};

export default function Leaves() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8800/leave-type-distribution')
      .then((response) => {
        const rows = (response.data || []).map((row) => [
          row.leave_type_name, Number(row.total_days) || 0,
        ]);
        setData([["Type", "Leave Days"], ...rows]);
      })
      .catch((error) => {
        console.error("Error fetching leave type distribution:", error);
        setData([["Type", "Leave Days"]]);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasData = data && data.length > 1;

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
              <PieChartIcon color="primary" fontSize="small" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Leave Type Distribution
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 400, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <CircularProgress size={32} />
            ) : hasData ? (
              <Chart
                chartType="PieChart"
                data={data}
                options={options}
                width={"100%"}
                height={"100%"}
              />
            ) : (
              <Typography color="text.secondary">No leave data available yet.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
