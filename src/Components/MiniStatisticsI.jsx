import { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, Typography, CardContent, Box } from '@mui/material';

export default function Data() {

  return (
     
          <Card elevation={3} sx={{ backgroundColor: '#f0f4ff', padding: '20px', borderRadius: '15px', height: '100%' }}>
            <CardContent  align="center">
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Inactive Employee
              </Typography>
              <Typography variant="h4" color="primary">
                22
              </Typography>
            </CardContent>
          </Card>
  );
}
