//import { useState } from "react";
import {NavLink, Outlet, redirect, useLoaderData} from "react-router-dom";


import { requestMySpotifyAccount } from "../api";


export async function loader(){

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestMySpotifyAccount(access_token);
    console.log(data);
    const display_name:string = data.display_name;
    return display_name;
  }catch(err){
    console.log("error in loader");
    console.log(err);
    return err;
  }
}


export default function RealTopPage(){

  //const [range, setRange] = useState(0);

  const accountData = useLoaderData();
  let display_name:string = "???"
  if(typeof accountData === "string"){
    display_name = accountData
  }

  return(
    <div className="max-h-screen flex flex-col">
      <div className="basis-1/4 flex flex-col ">
      <h1 className="basis-1/2 text-purple-200 font-bold text-4xl text-center my-5">
        {display_name}'s Top Songs
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
      <div className="flex mt-2">
      <a 
        href="/real-top/month"
        className="flex flex-1 items-center justify-center  bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-t-2 border-r-2 hover:border-purple-600"
        >top
      </a>
      <a 
        href="/saved/0"
        className="flex flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-t-2 border-l-2 hover:border-purple-600"
        >saved
      </a>
      <a 
        href="/link-search"
        className="flex flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-t-2 border-l-2 hover:border-purple-600"
        >search
      </a>
      </div>
    </div>
  )
}