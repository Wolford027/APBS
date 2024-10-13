import { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, Typography, CardContent, Box } from '@mui/material';

export default function Data() {

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

  
          <Card elevation={3} sx={{ backgroundColor: '#f0f4ff', padding: '20px', borderRadius: '15px', height: '100%' }}>
            <CardContent  align="center">
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Employee
              </Typography>
              <Typography variant="h4" color="primary">
              {countemp}
              </Typography>
            </CardContent>
          </Card>

  );
}
