import {React} from 'react'
import Company from '../Components/Company'
import SideNav from '../Components/SideNav'
import DepartmentFilter from '../Components/DepartmentFilter'
import DataWork from '../Components/DataWork'
import TotalEmployee from '../Components/TotalEmployee'
import Leaves from '../Components/Leaves'
import AttendanceDepartment from '../Components/AttendanceDepartment'

export default function Dashboard(){

  return(

    <>
    <SideNav/>
    <Company/>
    <DepartmentFilter/>
    <DataWork/>
    <TotalEmployee/>
    <Leaves/>
    <AttendanceDepartment/>
    </>
  )
}