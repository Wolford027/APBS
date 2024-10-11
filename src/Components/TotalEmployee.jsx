import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function TotalEmployee() {
  const [countemp, setCountemp] = useState(0); // Correct state initialization

  useEffect(() => {
    axios.get("http://localhost:8800/count_emp") // Use the correct backend URL
      .then((response) => {
        console.log("API response:", response.data); // Debugging: log the API response
        if (response.data && response.data.length > 0) {
          setCountemp(response.data[0].count); // Update state with employee count
        } else {
          console.error("Unexpected response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching employee count:", error));
  }, []); // Dependency array ensures this runs once after the initial render

  return (
    <Box sx={{ justifyContent: 'start', mt: -7, marginLeft: -90 }}>
      <Card elevation={2} sx={{ maxWidth: 245, marginLeft: 125, marginTop: -33 }}>
        <CardContent>
          <Typography><strong><center>Total Employee</center></strong></Typography>
          <Typography sx={{ opacity: 0.7 }}><strong><center>{countemp}</center></strong></Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
