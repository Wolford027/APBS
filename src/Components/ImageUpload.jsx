import React from 'react'
import { TextField } from '@mui/material'

export default function ImageUpload({ onChange }) {

    return (
        <div>
            <TextField
                type="file"
                name="file"
                onChange={onChange}
                inputProps={{ accept: 'image/*' }}
                sx={{
                    width: 150,           // Set the width
                    marginLeft: 1,        // Adjust the left margin
                    '& .MuiInputBase-input': {
                        height: '23px',     // Adjust height
                        fontSize: '14px',   // Adjust font size
                        padding: '1px',
                        margin: 0     // Adjust padding
                    },
                }}
            />

        </div>
    );
}
