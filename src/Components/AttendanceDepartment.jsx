import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { Card, CardContent, Typography, Box } from '@mui/material';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class App extends Component {
  render() {
    const options = {
      title: {
        text: "Attendance per Department"
      },
      toolTip: {
        shared: true
      },
      legend: {
        verticalAlign: "top"
      },
      axisY: {
        suffix: "%"
      },
      data: [
        {
          type: "stackedBar100",
          color: "#6497b1",
          name: "Present",
          showInLegend: true,
          indexLabel: "{y}%",
          indexLabelFontColor: "white",
          yValueFormatString: "#,###'%'",
          dataPoints: [
            { label: "IT Department", y: 85 },
            { label: "Finance Department", y: 79 },
            { label: "Marketing Department", y: 77 },
            { label: "Sales Department", y: 68 },
          ]
        },
        {
          type: "stackedBar100",
          color: "#b3cde0",
          name: "Absent",
          showInLegend: true,
          indexLabel: "{y}%",
          indexLabelFontColor: "white",
          yValueFormatString: "#,###'%'",
          dataPoints: [
            { label: "IT Department", y: 15 },
            { label: "Finance Department", y: 21 },
            { label: "Marketing Department", y: 23 },
            { label: "Sales Department", y: 32 },
          ]
        }
      ]
    };

    return (
      <Box sx={{ display: 'flex', justifyContent: 'start', mt: -80, marginLeft: -15 }}>
        <Card elevation={3} sx={{ width: '100%', maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom>
              Attendance per Department
            </Typography>
            <CanvasJSChart options={options} />
          </CardContent>
        </Card>
      </Box>
    );
  }
}

export default App;
