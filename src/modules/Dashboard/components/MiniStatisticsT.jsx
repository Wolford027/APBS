import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import GroupsIcon from '@mui/icons-material/Groups';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { durations, ease } from '../../../shared/animations';

export default function Data() {

  const [countemp, setCountemp] = useState(0); // Correct state initialization
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    axios.get("http://localhost:8800/count_emp") // Use the correct backend URL
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setCountemp(response.data[0].count); // Update state with employee count
        } else {
          console.error("Unexpected response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching employee count:", error));
  }, []); // Dependency array ensures this runs once after the initial render

  useEffect(() => {
    const controls = animate(count, Number(countemp) || 0, { duration: 0.8, ease: 'easeOut' });
    return () => controls.stop();
  }, [count, countemp]);

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
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
          }}
        >
          <GroupsIcon color="secondary" />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total Employee
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            <motion.span>{rounded}</motion.span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
