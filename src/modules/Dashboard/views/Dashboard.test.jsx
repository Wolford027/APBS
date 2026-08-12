import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import axios from "axios"

import Dashboard from "./Dashboard"

const mockUseAuth = jest.fn()

jest.mock("axios")
jest.mock("../../Auth/hooks/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}))
jest.mock("../../../shared/components/PageLayout", () => ({ title, actions, children }) => (
  <main>
    <h1>{title}</h1>
    {actions}
    {children}
  </main>
))
jest.mock("../components/MiniStatisticsA", () => () => <div>Active employees metric</div>)
jest.mock("../components/MiniStatisticsI", () => () => <div>Inactive employees metric</div>)
jest.mock("../components/MiniStatisticsT", () => () => <div>Total employees metric</div>)
jest.mock("../components/Calendar", () => () => <div>Calendar and event data</div>)
jest.mock("../components/AttendanceDepartment", () => () => <div>Attendance by department data</div>)
jest.mock("../components/Leaves", () => () => <div>Leave type distribution data</div>)
jest.mock("../components/ViewNotificationModal", () => () => <div>Contract notification menu</div>)

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee-list" element={<div>Employee records workspace</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("CRM dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: "HR",
      username: "Jordan",
    })
    axios.get.mockResolvedValue({
      data: [{ emp_id: 7, f_name: "Alex", l_name: "Santos", dateofend: new Date().toISOString() }],
    })
  })

  test("keeps every existing dashboard data area in the CRM layout", async () => {
    renderDashboard()

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument()
    expect(screen.getByText("People operations workspace")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /Jordan/i })).toBeInTheDocument()
    expect(screen.getByText("Active employees metric")).toBeInTheDocument()
    expect(screen.getByText("Inactive employees metric")).toBeInTheDocument()
    expect(screen.getByText("Total employees metric")).toBeInTheDocument()
    expect(screen.getByText("Calendar and event data")).toBeInTheDocument()
    expect(screen.getByText("Attendance by department data")).toBeInTheDocument()
    expect(screen.getByText("Leave type distribution data")).toBeInTheDocument()

    await waitFor(() => expect(screen.getByLabelText("View notifications")).toHaveTextContent("1"))
    expect(axios.get).toHaveBeenCalledWith("http://localhost:8800/event")
  })

  test("shows role-appropriate CRM shortcuts and navigates to the primary workspace", async () => {
    renderDashboard()

    await waitFor(() => expect(screen.getByLabelText("View notifications")).toHaveTextContent("1"))

    expect(screen.getByRole("button", { name: "Employee records" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Attendance: Review time and attendance/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Leave requests: Manage employee leave/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Employee reports: Open workforce reporting/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Payroll runs:/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Employee records" }))

    expect(screen.getByText("Employee records workspace")).toBeInTheDocument()
  })
})
