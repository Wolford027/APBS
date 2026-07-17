import React, { useState, useEffect } from 'react';
import PageLayout from '../../../shared/components/PageLayout';
import Box from '@mui/material/Box';
import PremiumTable, { TableSkeleton, TableEmptyState } from '../../../shared/components/PremiumTable';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Button } from '@mui/material';
import axios from 'axios';
import SearchBar from '../../../shared/components/SearchBar'
import { useDialogs } from '@toolpad/core';

export default function ArchivedEmployee() {
  const [archivedlist, setArchivedlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const dialogs = useDialogs();

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const res = await axios.get('http://localhost:8800/archived');
      console.log(res.data)
      setArchivedlist(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUnarchive = async (id) => {
    const confirmed = await dialogs.confirm('Are you sure you want to Unarchive this?', {
      okText: 'Yes',
      cancelText: 'No',
    });
    if (confirmed) {
      try {
        const response = await axios.put(`http://localhost:8800/emp/${id}`, { is_archive: 0 });
        console.log(response.data);
        if (response.data.status === 1) {
          // Remove the unarchived employee from the archived list
          setArchivedlist(archivedlist.filter(arch => arch.id !== id));
          fetchArchive();
        } else {
          alert('Failed to unarchive employee');
        }
        await dialogs.alert("Unarchived Successful");
      } catch (error) {
        console.error("There was an error unarchiving the employee!", error);
      }
    } else {
      await dialogs.alert('Ok, forget about it!');
    }
  };

  return (
    <PageLayout title="Archived Employees">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <SearchBar />
      </Box>

      <PremiumTable>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee Id</th>
              <th style={{ width: '20%' }}>Employee Name</th>
              <th>Employee Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={['id', 'avatarText', 'text', 'button']} />
            ) : archivedlist.length === 0 ? (
              <TableEmptyState
                colSpan={4}
                icon={Inventory2OutlinedIcon}
                title="No archived employees"
                description="When you archive an employee, they move here and can be restored anytime."
              />
            ) : (
              archivedlist.map((emp) => (
                <tr key={emp.emp_id}>
                  <td style={{ cursor: "pointer" }}>{emp.emp_id}</td>
                  <td style={{ cursor: "pointer" }}>{emp.f_name + " " + emp.l_name}</td>
                  <td style={{ cursor: "pointer" }}>{emp.emp_pos}</td>
                  <td>
                    <Button
                      variant='contained'
                      style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }}
                      onClick={() => handleUnarchive(emp.emp_id)}
                    >
                      Unarchive
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </PremiumTable>
    </PageLayout>
  );
}
