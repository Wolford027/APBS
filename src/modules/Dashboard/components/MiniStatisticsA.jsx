import React, { useState, useEffect } from 'react';
import { Card, Typography, CardContent } from '@mui/material';
import axios from 'axios';

export default function Data() {
  const [countActiveEmp, SetCountActiveEmp] = useState(0);

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

  return (
          <Card elevation={3} sx={{ backgroundColor: '#f0f4ff', padding: '20px', borderRadius: '15px', height: '70%', width: '300px' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Active Employee
              </Typography>
              <Typography variant="h4" color="primary">
                {countActiveEmp}
              </Typography>
            </CardContent>
          </Card>
  );
}
