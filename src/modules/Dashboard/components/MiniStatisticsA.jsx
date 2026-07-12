import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import axios from 'axios';
import { durations, ease } from '../../../shared/animations';

export default function Data() {
  const [countActiveEmp, SetCountActiveEmp] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    axios.get("http://localhost:8800/count_emp")
      .then((response) => {
        if (response.data && response.data.length > 0) {
          SetCountActiveEmp(response.data[0].count);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching active employee count:", error));
  }, []);

  useEffect(() => {
    const controls = animate(count, Number(countActiveEmp) || 0, { duration: 0.8, ease: 'easeOut' });
    return () => controls.stop();
  }, [count, countActiveEmp]);

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ duration: durations.micro, ease }}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <PeopleAltIcon color="primary" />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Employee
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            <motion.span>{rounded}</motion.span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
