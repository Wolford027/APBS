import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  text: { fontSize: 12 },
  table: { display: "flex", flexDirection: "column", marginTop: 10 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #000", padding: 5 },
  tableCell: { flex: 1, fontSize: 10, textAlign: "left" },
});

const convertTimeToDecimal = (timeString) => {
  if (!timeString) return 0; // Handle null/undefined case

  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours + minutes / 60 + seconds / 3600;
};

const PayslipPDF = ({ payslipData }) => (
  <Document>
    {payslipData.map((data, index) => {
      // Convert RD hours to decimal
      const regularHoursValue = Number(data.hourly_rate || 0) * convertTimeToDecimal(data.total_reg_hours_rt1_r);

      // Get numeric values for other earnings (ensure they are numbers)
      const overtimeValue = Number(data.total_overtime_hours_value_rt1) || 0;
      const nightDiffValue = Number(data.total_nightdiff_hours_value_rt1) || 0;
      const overtimeNightDiffValue = Number(data.total_overtime_nightdiff_hours_value_rt1) || 0;

      // Compute total earnings
      const totalEarnings = regularHoursValue + overtimeValue + nightDiffValue + overtimeNightDiffValue;

      return (
        <Page size="A4" key={index} style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>Company Name</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.text}>Employee Name: {data.full_name}</Text>
            <Text style={styles.text}>Employee Number: {data.emp_id}</Text>
            <Text style={styles.text}>Payroll Period: {data.startDate}</Text>
            <Text style={styles.text}>Payout Date: {data.endDate}</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Earnings</Text>
              <Text style={styles.tableCell}>Hours</Text>
              <Text style={styles.tableCell}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>RD</Text>
              <Text style={styles.tableCell}>{data.total_reg_hours_rt1_r}</Text>
              <Text style={styles.tableCell}>PHP {regularHoursValue.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>RD-OT</Text>
              <Text style={styles.tableCell}>{data.total_overtime_hours_rt1_r}</Text>
              <Text style={styles.tableCell}>PHP {overtimeValue.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>RD-ND</Text>
              <Text style={styles.tableCell}>{data.total_nightdiff_hours_rt1_r}</Text>
              <Text style={styles.tableCell}>PHP {nightDiffValue.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>RD-ND-OT</Text>
              <Text style={styles.tableCell}>{data.overtime_nightdiff_hours_rt1_r}</Text>
              <Text style={styles.tableCell}>PHP {overtimeNightDiffValue.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Total Earnings</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}>PHP {totalEarnings.toFixed(2)}</Text>
            </View>
          </View>
        </Page>
      );
    })}
  </Document>
);

export default PayslipPDF;
