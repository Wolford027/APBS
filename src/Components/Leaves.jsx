import * as React from 'react'
import { Card, CardContent, Typography} from '@mui/material'
import { Chart } from "react-google-charts"


export const data = [
    ["Type", "Leave per Day"],
    ["Sick Leave", 11],
    ["Casual Leave", 2],
    ["Conpensatory Leave", 12],
    ["Paternity Leave", 5],
    ["Maternity Leave", 5],
  ];
  
  export const options = {
    title: "My Daily Activities",
    pieHole: 0,
    is3D: true,
  };

export default function Leaves() {


  return (
    <div>
        <Card elevation={2} sx={{maxWidth: 345, marginLeft:80, marginTop: 25}}>
            <CardContent>
                <Typography><strong>Leave Type Distribution</strong></Typography>
                <Chart
                    chartType="PieChart"
                    data={data}
                    options={options}/>
            </CardContent>
        </Card>
    </div>
  );
}