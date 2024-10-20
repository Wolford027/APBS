// UploadAttendanceModal.jsx
import React, { useCallback, useState, useMemo } from 'react';
import { Box, Modal, Typography, Button } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useDialogs } from '@toolpad/core';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function UploadAttendanceModal({ onOpen, onClose, onFileData, onRefresh }) {
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

        try {
          const response = await axios.post('http://localhost:8800/upload-attendance', {
            data: worksheet,
          });
          console.log(response.data);
          onRefresh(); // Call onRefresh to fetch updated attendance data
          onClose(); // Close modal after upload
        } catch (error) {
          console.error('Error uploading data:', error);
          dialogs.alert({
            title: 'Upload Error',
            description: 'There was an error uploading the data.',
          });
        }
      };
      reader.readAsBinaryString(excelFile);
    } else {
      dialogs.alert({
        title: 'File Upload Error',
        description: 'Please select a file to upload.',
      });
    }
  };

  return (
    <Modal open={onOpen} onClose={onClose} closeAfterTransition>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 4,
            width: { xs: '80%', sm: '60%', md: '50%' },
            height: { xs: '80%', sm: '60%', md: '70%' },
            boxShadow: 24,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" mb={2}>Upload Attendance File</Typography>

          <Box
            {...getRootProps()}
            sx={{
              width: '100%',
              border: '2px dashed gray',
              borderRadius: 2,
              padding: 3,
              textAlign: 'center',
              backgroundColor: isDragActive ? '#f0f0f0' : 'white',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography>Drop the file here...</Typography>
            ) : (
              <Typography>Drag & drop an Excel or CSV file here, or click to select one</Typography>
            )}
          </Box>

          {excelFile && <Typography sx={{ mt: 2 }}>File: {excelFile.name}</Typography>}

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ mt: 2 }}
          >
            Upload and Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
