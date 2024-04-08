import {React} from 'react'
import Company from '../Components/Company'
import SideNav from '../Components/SideNav'
import DepartmentFilter from '../Components/DepartmentFilter'
import DataWork from '../Components/DataWork'
import TotalEmployee from '../Components/TotalEmployee'
import Leaves from '../Components/Leaves'

export default function Dashboard(){

  return(

    <>
    <SideNav/>
    <Company/>
    <DepartmentFilter/>
    <DataWork/>
    <TotalEmployee/>
    <Leaves/>
    </>
  )
}