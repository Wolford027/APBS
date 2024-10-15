import React, { useEffect } from "react"
import SideNav from "../Components/SideNav"
import Leaves from "../Components/Leaves"
import AttendanceDepartment from "../Components/AttendanceDepartment"
import Calendar from "../Components/Calendar"
import MiniStatisticsA from "../Components/MiniStatisticsA"
import MiniStatisticsI from "../Components/MiniStatisticsI"
import MiniStatisticsT from "../Components/MiniStatisticsT"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../_Auth/AuthContext"
import { Box, Grid, AppBar, Toolbar, Typography } from "@mui/material"

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const drawerWidth = 240;

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <SideNav />
      <Box marginLeft={30} >
        <Grid
          container
          sx={{ padding: "20px", marginTop: -10}}
        >
          <Grid container spacing={2} sx={{ padding: '20px' }}>
            <Grid item xs={12} sm={6} md={4} sx={{ flexBasis: '60%',transform: 'scale(0.75)' }}>
              <MiniStatisticsA />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ flexBasis: '60%',transform: 'scale(0.75)' }}>
              <MiniStatisticsI />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ flexBasis: '60%',transform: 'scale(0.75)' }}>
              <MiniStatisticsT />
            </Grid>
          </Grid>
        </Grid>

        <Grid container sx={{ padding: '10px', marginTop:-12 }}>
          <Grid item xs={12} sm={6} md={6} sx={{ flexBasis: '60%',transform: 'scale(0.80)'}}>
            <AttendanceDepartment />
          </Grid>
          <Grid item xs={12} sm={6} md={6} sx={{ flexBasis: '60%',transform: 'scale(0.80)' }}>
            <Leaves />
          </Grid>
        </Grid>
        <Grid container sx={{ padding: '10px', marginTop: -12 }}>
          <Grid item xs={12} sm={6} md={4} sx={{ flexBasis: '60%', transform: 'scale(0.75)' }}>
            <Calendar />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
