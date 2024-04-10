import * as React from 'react'
import { Card, CardContent, Typography} from '@mui/material'
import { Chart } from "react-google-charts"


export const data = [
    ["Task", "Hours per Day"],
    ["Office", 11],
    ["Home", 2],
  ];
  
  export const options = {
    title: "My Daily Activities",
    pieHole: 0,
    is3D: true,
  };

export default function DataWork() {


  return (
    <div>
        <Card elevation={2} sx={{maxWidth: 345, marginLeft:80, marginTop:-17}}>
            <CardContent>
                <Typography><strong>Employee Work Location Breakdown</strong></Typography>
                <Chart
                    chartType="PieChart"
                    data={data}
                    options={options}/>
            </CardContent>
        </Card>
    </div>
  );
}