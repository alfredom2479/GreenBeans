import {Outlet} from "react-router-dom";
import TopNavItem from "../components/TopNavItem";


export default function RealTopPage(){

  return(
    <div className="h-full pb-16 flex flex-col">
      <div className="basis-1/4 flex flex-col ">
      <h1 className="basis-1/2 text-purple-200 font-bold text-4xl text-center my-5">
        Your Top Songs
      </h1> 
      <nav className=" basis-1/2 font-bold bg-stone-800 ">
        <ul className={`flex text-white`}>
          <TopNavItem path="month" name="month"/>
          <TopNavItem path="sixmonths" name="six months"/>
          <TopNavItem path="alltime" name="years+"/>
        </ul>
      </nav>
      </div>
      <Outlet/>
    </div>
  )
}