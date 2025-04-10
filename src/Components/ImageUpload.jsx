import React, { useState } from 'react';
import { Avatar } from '@mui/material';

export default function ImageUpload({ onChange }) {
    const [image, setImage] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("File selected:", file);
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
            if (onChange) {
                onChange(file);
            }
        } else {
            console.log("No file selected");
        }
    };
    
    return (
        <div style={{ display: 'flex', marginRight: '400px' }}>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
            />
            <label htmlFor="image-upload">
                <Avatar
                    src={image}
                    sx={{ width: 100, height: 100, cursor: 'pointer' }}
                />
            </label>
        </div>
    );
}