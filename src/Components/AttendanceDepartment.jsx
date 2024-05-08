/* App.js */
import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { Card, CardContent } from '@mui/material';
import '../Styles/Canvas.css';
 

/*var CanvasJS = CanvasJSReact.CanvasJS;*/
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
			data: [{
				type: "stackedBar100",
				color: "#6497b1",
				name: "Present",
				showInLegend: true,
				indexLabel: "{y}",
				indexLabelFontColor: "white",
				yValueFormatString: "#,###'%'",
				dataPoints: [
					{ label: "IT Department",   y: 85 },
					{ label: "Finance Deparment",   y: 79 },
					{ label: "Marketing Department",   y: 77 },
					{ label: "Sales Department",   y: 68 }
				]
			},{
				type: "stackedBar100",
				color: "#b3cde0",
				name: "Absent",
				showInLegend: true,
				indexLabel: "{y}%",
				indexLabelFontColor: "white",
				yValueFormatString: "#,###'%'",
				dataPoints: [
					{ label: "IT Deparment",   y: 15 },
					{ label: "Finance Department",   y: 21 },
					{ label: "Marketing Department",   y: 23 },
					{ label: "Sales Department",   y: 32 }
				]
			}]
		}
		return (
		<div>
      <Card elevation={2} sx={{maxWidth: 345, marginLeft:35, marginTop: -50}}>
        <CardContent>
          <CanvasJSChart options = {options}/>
        </CardContent>
      </Card>
		</div>
		);
	}
}
export default App;  