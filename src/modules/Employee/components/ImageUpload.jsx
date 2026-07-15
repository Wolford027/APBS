import React, { useState } from 'react';
import { Avatar, Box, Button, Typography, alpha } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

export default function ImageUpload({ onChange }) {
    const [image, setImage] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
            setFileName(file.name);
            if (onChange) {
                onChange(file);
            }
        }
    };

    const handleRemove = () => {
        setImage(null);
        setFileName('');
        if (onChange) {
            onChange(null);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
            />
            <Box
                component="label"
                htmlFor="image-upload"
                sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    flexShrink: 0,
                    '&:hover .upload-badge': { bgcolor: 'primary.dark' },
                }}
            >
                <Avatar
                    src={image}
                    alt={image ? 'Employee photo preview' : ''}
                    sx={{
                        width: 84,
                        height: 84,
                        color: 'primary.main',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        border: '1px dashed',
                        borderColor: image ? 'transparent' : 'divider',
                    }}
                >
                    <PersonOutlineIcon sx={{ fontSize: 38 }} />
                </Avatar>
                <Box
                    className="upload-badge"
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                        transition: 'background-color 0.15s ease',
                    }}
                >
                    <PhotoCameraIcon sx={{ fontSize: 15 }} />
                </Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">Employee photo</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 320 }}>
                    {fileName || 'JPG or PNG — shown on the employee\'s profile'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        component="label"
                        htmlFor="image-upload"
                        startIcon={<FileUploadOutlinedIcon />}
                    >
                        {image ? 'Change photo' : 'Upload photo'}
                    </Button>
                    {image && (
                        <Button size="small" color="error" onClick={handleRemove}>
                            Remove
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
