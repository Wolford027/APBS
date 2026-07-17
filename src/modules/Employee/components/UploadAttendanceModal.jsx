// UploadAttendanceModal.jsx
import React, { useCallback, useState, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PremiumModal from '../../../shared/components/PremiumModal';
import { useDropzone } from 'react-dropzone';
import { useDialogs } from '@toolpad/core';
import axios from 'axios';
import * as XLSX from 'xlsx';

const PRIMARY = '#2563EB';

export default function UploadAttendanceModal({ onOpen, onClose, onFileData, onRefresh = () => {} }) {
  const [excelFile, setExcelFile] = useState(null);
  const dialogs = useDialogs();

  const fileTypes = useMemo(() => [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ], []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file) {
      if (fileTypes.includes(file.type)) {
        setExcelFile(file);
      } else {
        dialogs.alert({
          title: 'File Upload Error',
          description: 'Invalid file type. Please upload an Excel or CSV file.',
        });
        setExcelFile(null);
      }
    }
  }, [fileTypes, dialogs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes.join(','),
    multiple: false
  });

  const handleUpload = async () => {
    if (excelFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        // Skip the header row
        const dataWithoutHeaders = worksheet.slice(1);

        try {
          const response = await axios.post('http://localhost:8800/upload-attendance', {
            data: dataWithoutHeaders, // Send data without headers
          });
          console.log(response.data);
          if (typeof onRefresh === 'function') {
            onRefresh();
          }
          onClose(); // Close modal after upload
        } catch (error) {
          console.error('Error uploading data:', error);
          dialogs.alert('Upload Error: There was an error uploading the data.');
        }
      };
      reader.readAsBinaryString(excelFile);
    } else {
      dialogs.alert('Upload Error: There was an error uploading the data.');
    }
  };

  return (
    <PremiumModal
      open={onOpen}
      onClose={onClose}
      title="Upload Attendance File"
      subtitle="Import time-in and time-out records from an Excel or CSV export."
      icon={CloudUploadOutlinedIcon}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!excelFile}>
            Upload and Close
          </Button>
        </>
      }
    >
      <Box
        {...getRootProps()}
        sx={{
          width: '100%',
          border: '2px dashed',
          borderColor: isDragActive ? PRIMARY : 'divider',
          borderRadius: '12px',
          px: 3,
          py: 5,
          textAlign: 'center',
          backgroundColor: isDragActive ? alpha(PRIMARY, 0.05) : '#F8FAFC',
          cursor: 'pointer',
          transition: 'border-color 150ms ease, background-color 150ms ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: isDragActive ? PRIMARY : '#94A3B8' }} />
        {isDragActive ? (
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>Drop the file here…</Typography>
        ) : (
          <>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              Drag &amp; drop a file here, or click to browse
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
              Supports .xlsx and .csv files
            </Typography>
          </>
        )}
      </Box>

      {excelFile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            px: 1.75,
            py: 1.25,
            bgcolor: '#F8FAFC',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
          }}
        >
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, wordBreak: 'break-all' }}>
            {excelFile.name}
          </Typography>
        </Box>
      )}
    </PremiumModal>
  );
}
