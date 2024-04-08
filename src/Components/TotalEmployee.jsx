import * as React from 'react'
import { Card, CardContent, Typography} from '@mui/material'

export default function TotalEmployee() {
  return (
    <div>
      <Card elevation={2} sx={{maxWidth: 245, marginLeft:125, marginTop:-33}}>
        <CardContent>
            <Typography><strong><center>Total Employee</center></strong></Typography>
            <Typography sx={{opacity: 0.7}}><strong><center>23</center></strong></Typography>
        </CardContent>
      </Card>
    </div>
  )
}
