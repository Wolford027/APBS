import React from 'react'
import { TextField } from '@mui/material'

export default function ImageUpload({onChange}) {

    return (
        <div>
            <TextField
                type='file'
                name='file'
                onChange={onChange}
                inputProps={{ accept: 'image/*' }}
                sx={{width: 150, marginLeft: 1}}
            />
        </div>
    );
}
