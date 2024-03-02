import Pic from '../assets/B.png'
import SideNav from '../Components/SideNav'

export default function Dashboard(){
  const divStyle = {margin:"0 0 0 400px"}

  return(

    <>
      <SideNav/>

      <div style={divStyle}>
        <img alt='try' src={Pic} />
      </div>
    </>


  )


}