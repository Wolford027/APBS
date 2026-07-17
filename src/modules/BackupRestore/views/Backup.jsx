import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import React, { useRef, useState } from "react";
import PageLayout from "../../../shared/components/PageLayout";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { alpha } from "@mui/material/styles";
import axios from "axios";

function IconBadge({ icon: Icon, color, bg }) {
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: bg,
        color: color,
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 24 }} />
    </Box>
  );
}

function Backup() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [backingUp, setBackingUp] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  const notify = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await axios.get("http://localhost:8800/backup");
      notify(response.data || "Backup created successfully!", "success");
    } catch (error) {
      notify("Error creating backup.", "error");
    } finally {
      setBackingUp(false);
    }
  };

  const handleFileSelected = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPendingFile(file);
    }
    // Allow picking the same file again later
    event.target.value = "";
  };

  const handleConfirmRestore = async () => {
    if (!pendingFile) return;
    setRestoring(true);
    const formData = new FormData();
    formData.append("file", pendingFile);

    try {
      const response = await axios.post(
        "http://localhost:8800/restore",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      notify(response.data || "Database restored successfully!", "success");
    } catch (error) {
      notify("Error restoring database.", "error");
    } finally {
      setRestoring(false);
      setPendingFile(null);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
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

      notify("Backup downloaded successfully!", "success");
    } catch (error) {
      notify("Error downloading backup.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageLayout title="Backup & Restore">
      <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 3, maxWidth: 560 }}>
        Protect your payroll data. Create a backup before major changes, and
        restore only when you are certain — restoring replaces everything.
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Backup Card */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                <IconBadge
                  icon={BackupIcon}
                  color="primary.main"
                  bg={alpha("#2563EB", 0.1)}
                />
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                    Backup Database
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.5 }}>
                    Save a full snapshot of your current database. Keep a copy
                    somewhere safe before payroll runs or big edits.
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mt: "auto", mb: 2 }} />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={
                    backingUp ? <CircularProgress size={16} color="inherit" /> : <BackupIcon />
                  }
                  onClick={handleBackup}
                  disabled={backingUp}
                >
                  {backingUp ? "Creating Backup…" : "Create Backup"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={
                    downloading ? <CircularProgress size={16} /> : <CloudDownloadIcon />
                  }
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? "Downloading…" : "Download Backup"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Restore Card */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                <IconBadge
                  icon={RestoreIcon}
                  color="#B45309"
                  bg={alpha("#F59E0B", 0.12)}
                />
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                    Restore Database
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.5 }}>
                    Bring the system back to a previous state from a backup file
                    (.sql, .backup, or .dump).
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 1.25,
                  alignItems: "flex-start",
                  bgcolor: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: "10px",
                  px: 1.75,
                  py: 1.25,
                  mb: 2,
                }}
              >
                <WarningAmberRoundedIcon sx={{ fontSize: 18, color: "#B45309", mt: "1px" }} />
                <Typography sx={{ fontSize: 13, color: "#92400E" }}>
                  Restoring overwrites all current data. You will be asked to
                  confirm before anything changes.
                </Typography>
              </Box>

              <Divider sx={{ mt: "auto", mb: 2 }} />
              <Box>
                <input
                  ref={fileInputRef}
                  accept=".backup,.sql,.dump"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileSelected}
                />
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<RestoreIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={restoring}
                >
                  Choose Backup File…
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirm Restore Dialog */}
      <Dialog open={Boolean(pendingFile)} onClose={() => !restoring && setPendingFile(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25, fontWeight: 700 }}>
          <WarningAmberRoundedIcon sx={{ color: "#B45309" }} />
          Restore database?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2 }}>
            This will replace <strong>all current data</strong> with the
            contents of the selected backup. This action cannot be undone.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#F8FAFC",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "10px",
              px: 1.75,
              py: 1.25,
            }}
          >
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, wordBreak: "break-all" }}>
              {pendingFile?.name}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPendingFile(null)} disabled={restoring}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={restoring ? <CircularProgress size={16} color="inherit" /> : <RestoreIcon />}
            onClick={handleConfirmRestore}
            disabled={restoring}
          >
            {restoring ? "Restoring…" : "Yes, Restore"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </PageLayout>
  );
}

export default Backup;
