import {NavLink, Outlet} from "react-router-dom";


export default function RealTopPage(){

  return(
    <div className="h-full pb-16 flex flex-col">
      <div className="basis-1/4 flex flex-col ">
      <h1 className="basis-1/2 text-purple-200 font-bold text-4xl text-center my-5">
        Your Top Songs
      </h1> 
      <nav className=" basis-1/2 font-bold bg-stone-800 ">
        <ul className={`flex text-white`}>
          <li className={`flex-1  flex justify-center content-center `}>
          {/* u have to define string with default style and add
          to it if isActive is true with the appropriate styles */}
          
            <NavLink to="month" 
            className={({isActive})=>isActive ? "text-green-200 text-center w-full text-2xl align-middle truncate" : "text-center w-full text-2xl align-middle truncate"}>
              Month
            </NavLink>
          </li>
          <li className={`flex-1  flex justify-center `}>
            <NavLink to="sixmonths" 
            className={({isActive})=>isActive ? "text-green-200 text-center w-full text-2xl truncate" : "text-center w-full text-2xl truncate"}>
              Six Months
            </NavLink>
          </li>
          <li className={`flex-1  flex justify-center` }>
            <NavLink to="alltime"
            className={({isActive})=> isActive ? "text-green-200 text-center w-full text-2xl" : "text-center w-full text-2xl"}>
              Years+
            </NavLink>
          </li>
        </ul>
      </nav>
      </div>
      <Outlet/>
    </div>
  )
}