import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import PremiumModal from '../../../shared/components/PremiumModal';
import PremiumTable, { TableSkeleton, TableEmptyState } from '../../../shared/components/PremiumTable';
import axios from 'axios';

function SectionLabel({ children }) {
    return (
        <Typography
            sx={{
                fontSize: 11.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'text.secondary',
                mb: 1,
            }}
        >
            {children}
        </Typography>
    );
}

function StatTile({ label, value }) {
    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 120,
                bgcolor: '#F8FAFC',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '10px',
                px: 2,
                py: 1.5,
            }}
        >
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 0.25 }}>{value ?? '—'}</Typography>
        </Box>
    );
}

export default function EmployeeLeaveInfo({ onOpen, onClose, selectedEmployee }) {
    const [leaveData1, setLeaveData1] = useState([]);
    const [leaveData2, setLeaveData2] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployeeLeaveData = async () => {
            if (!selectedEmployee) {
                console.error('Selected employee data is not available');
                setError("No employee selected.");
                setLoading(false);
                return;
            }

            setLoading(true); // Start loading

            try {
                console.log("Fetching leave data for Employee ID:", selectedEmployee.emp_id);

                // Fetch data from both endpoints in parallel
                const [leaveTableResponse, leaveResponse, leavebalanceResponse] = await Promise.all([
                    axios.get(`http://localhost:8800/empleavetable/${selectedEmployee.emp_id}`),
                    axios.get(`http://localhost:8800/empleavebalance/${selectedEmployee.emp_id}`),
                    axios.get(`http://localhost:8800/empleavesaved/${selectedEmployee.emp_id}`)
                ]);

                if (leaveTableResponse.data && leavebalanceResponse.data && leaveResponse.data.length > 0) {
                    setLeaveData1(leavebalanceResponse.data);
                    setLeaveData2(leaveResponse.data);
                    setEmployeeDetails({
                        emp_id: selectedEmployee.emp_id,
                        full_name: selectedEmployee.full_name,
                        total_leave: leaveTableResponse.data[0]?.total_leave_balance || 0,
                        total_consumed: leaveTableResponse.data[0]?.total_leave_spent || 0,
                        balance_leave: leaveTableResponse.data[0]?.total_leave_remaining || 0,
                    });
                    setError(null);
                } else {
                    setError("No leave data available for this employee.");
                }
            } catch (error) {
                console.error('Error fetching employee leave data:', error.response ? error.response.data : error.message);
                setError("Failed to fetch employee leave data.");
            } finally {
                setLoading(false);
            }
        };

        if (onOpen) {
            fetchEmployeeLeaveData();
        }
    }, [onOpen, selectedEmployee]);

    return (
        <PremiumModal
            open={onOpen}
            onClose={onClose}
            title="Employee Leave"
            subtitle={employeeDetails.full_name
                ? `${employeeDetails.full_name} · Employee ID ${employeeDetails.emp_id}`
                : 'Leave balances and filed leaves for this employee.'}
            icon={EventNoteOutlinedIcon}
            maxWidth="md"
        >
            {error && !loading ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <EventBusyOutlinedIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1 }} />
                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{error}</Typography>
                </Box>
            ) : (
                <>
                    <SectionLabel>Leave Summary</SectionLabel>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                        <StatTile label="Total Leave" value={loading ? '…' : employeeDetails.total_leave} />
                        <StatTile label="Consumed" value={loading ? '…' : employeeDetails.total_consumed} />
                        <StatTile label="Balance" value={loading ? '…' : employeeDetails.balance_leave} />
                    </Box>

                    <SectionLabel>Leave Balances by Type</SectionLabel>
                    <PremiumTable minWidth={520} containerSx={{ mb: 3 }}>
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Leave Type</th>
                                <th>Balance</th>
                                <th>Consumed</th>
                                <th>Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton rows={3} columns={['text', 'number', 'number', 'number']} />
                            ) : leaveData2.length === 0 ? (
                                <TableEmptyState
                                    colSpan={4}
                                    icon={EventNoteOutlinedIcon}
                                    title="No leave balances"
                                    description="This employee has no leave credits assigned yet."
                                />
                            ) : leaveData2.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.leave_type_name}</td>
                                    <td>{item.leave_balance}</td>
                                    <td>{item.leave_spent}</td>
                                    <td>{item.leave_remaining}</td>
                                </tr>
                            ))}
                        </tbody>
                    </PremiumTable>

                    <SectionLabel>Filed Leaves</SectionLabel>
                    <PremiumTable minWidth={520}>
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Leave Type</th>
                                <th>Days Used</th>
                                <th>Date Start</th>
                                <th>Date End</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton rows={3} columns={['text', 'number', 'date', 'date']} />
                            ) : leaveData1.length === 0 ? (
                                <TableEmptyState
                                    colSpan={4}
                                    icon={EventBusyOutlinedIcon}
                                    title="No filed leaves"
                                    description="Leaves filed by this employee will appear here."
                                />
                            ) : leaveData1.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.leave_type_name}</td>
                                    <td>{item.leave_use}</td>
                                    <td>{item.date_start}</td>
                                    <td>{item.date_end}</td>
                                </tr>
                            ))}
                        </tbody>
                    </PremiumTable>
                </>
            )}
        </PremiumModal>
    );
}
