import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import axios from "axios"

import AttendanceDepartment from "./AttendanceDepartment"
import Leaves from "./Leaves"

jest.mock("axios")
jest.mock("react-google-charts", () => ({
  Chart: ({ data, chartType }) => (
    <div data-testid={`${chartType}-chart`}>{data.flat().join(" | ")}</div>
  ),
}))

describe("dashboard analytics sample data", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    axios.get.mockResolvedValue({ data: [] })
  })

  test("shows labeled sample attendance data when the API has no records", async () => {
    render(<AttendanceDepartment />)

    await waitFor(() => expect(screen.getByText("Sample data")).toBeInTheDocument())
    expect(screen.getByTestId("BarChart-chart")).toHaveTextContent("Human Resources")
    expect(screen.getByTestId("BarChart-chart")).toHaveTextContent("Information Technology")
  })

  test("shows labeled sample leave data when the API has no records", async () => {
    render(<Leaves />)

    await waitFor(() => expect(screen.getByText("Sample data")).toBeInTheDocument())
    expect(screen.getByTestId("PieChart-chart")).toHaveTextContent("Vacation leave")
    expect(screen.getByTestId("PieChart-chart")).toHaveTextContent("Emergency leave")
  })
})
