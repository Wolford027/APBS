import {React} from 'react'
import Company from '../Components/Company'
import SideNav from '../Components/SideNav'
import Filter from '../Components/Filter'
import DataWork from '../Components/DataWork'

export default function Dashboard(){

  return(

    <>
    <SideNav/>
    <Company/>
    <Filter/>
    <DataWork/>
    </>
  )
}