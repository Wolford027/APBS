import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  Snackbar,
} from "@mui/material";
import React, { useState } from "react";
import SideNav from "../Components/SideNav";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { styled } from "@mui/material/styles";
import axios from "axios";

function Backup() {
  const drawerWidth = 240;
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const Input = styled("input")({
    display: "none",
  });

  const handleBackup = async () => {
    try {
      const response = await axios.get("http://localhost:8800/backup");
      setSnackbarMessage(response.data || "Backup created successfully!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Error creating backup.");
      setSnackbarSeverity("error");
    }
    setOpenSnackbar(true);
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "http://localhost:8800/restore",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setSnackbarMessage(response.data || "Database restored successfully!");
        setSnackbarSeverity("success");
      } catch (error) {
        setSnackbarMessage("Error restoring database.");
        setSnackbarSeverity("error");
      }
      setOpenSnackbar(true);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get("http://localhost:8800/download", {
        responseType: "blob",
      });

      // Create a link element to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "backup.sql");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbarMessage("Backup downloaded successfully!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Error downloading backup.");
      setSnackbarSeverity("error");
    }
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#1976d2",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Backup & Restore
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side Navigation */}
      <SideNav />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Grid container spacing={4}>
          {/* Backup Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <BackupIcon
                    sx={{ mr: 1, verticalAlign: "middle", color: "#1976d2" }}
                  />
                  Backup Database
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create a backup of your current database. This will save all
                  your data in a secure format.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={handleBackup}
                  sx={{ m: 1 }}
                >
                  Create Backup
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleDownload}
                  sx={{ m: 1 }}
                >
                  Download Backup
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Restore Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <RestoreIcon
                    sx={{ mr: 1, verticalAlign: "middle", color: "#ff5722" }}
                  />
                  Restore Database
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Restore your database from a previous backup file. Please note
                  this will override current data.
                </Typography>
              </CardContent>
              <CardActions>
                <label htmlFor="restore-file">
                  <Input
                    accept=".backup,.sql,.dump"
                    id="restore-file"
                    type="file"
                    onChange={handleRestore}
                  />
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<RestoreIcon />}
                    color="secondary"
                    sx={{ m: 1 }}
                  >
                    Restore from Backup
                  </Button>
                </label>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Snackbar for notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={8000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default Backup;
