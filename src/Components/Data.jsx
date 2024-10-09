import React from 'react';
import { Grid, Card, Typography, CardContent } from '@mui/material';

export default function Data() {
  return (
    <Grid container spacing={5} style={{ padding: '20px'}}>
      {/* Earnings */}
      <Grid item xs={12} sm={6} md={4}>
        <Card style={{ backgroundColor: '#f0f4ff', padding: '10px', borderRadius: '15px', height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              Earnings
            </Typography>
            <Typography variant="h4" color="primary">
              $350.4
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Spend this month */}
      <Grid item xs={12} sm={6} md={4}>
        <Card style={{ backgroundColor: '#f0f4ff', padding: '10px', borderRadius: '15px', height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              Spend this month
            </Typography>
            <Typography variant="h4" color="primary">
              $642.39
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Sales */}
      <Grid item xs={12} sm={6} md={4}>
        <Card style={{ backgroundColor: '#f0f4ff', padding: '10px', borderRadius: '15px', height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              Sales
            </Typography>
            <Typography variant="h4" color="primary">
              $574.34
            </Typography>
            <Typography variant="body2" style={{ color: 'green' }}>
              +23% since last month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Your Balance */}
      <Grid item xs={12} sm={6} md={4}>
        <Card style={{ backgroundColor: '#f0f4ff', padding: '10px', borderRadius: '15px', height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              Your Balance
            </Typography>
            <Typography variant="h4" color="primary">
              $1,000
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* New Tasks */}
      <Grid item xs={12} sm={6} md={4}>
        <Card style={{ backgroundColor: '#f0f4ff', padding: '10px', borderRadius: '15px', height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              New Tasks
            </Typography>
            <Typography variant="h4" color="primary">
              154
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Projects */}
      <Grid item xs={12} sm={6} md={4}>
        <Card style={{ backgroundColor: '#f0f4ff', padding: '10px', borderRadius: '15px', height: '100%'}}>
          <CardContent>
            <Typography variant="h6" color="textSecondary">
              Total Projects
            </Typography>
            <Typography variant="h4" color="primary">
              2935
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
