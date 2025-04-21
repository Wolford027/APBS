import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
    paddingVertical: 6,
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    textAlign: "left",
  },
});

// Generic Report PDF component
const ReportPDF = ({ title, subtitle, headers, data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          {headers.map((header, index) => (
            <Text key={index} style={styles.tableCell}>
              {header}
            </Text>
          ))}
        </View>

        {/* Table Rows */}
        {data.map((row, rowIndex) => (
          <View style={styles.tableRow} key={rowIndex}>
            {headers.map((header, cellIndex) => (
              <Text key={cellIndex} style={styles.tableCell}>
                {row[header.toLowerCase().replace(/\s/g, "_")] || ""}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default ReportPDF;