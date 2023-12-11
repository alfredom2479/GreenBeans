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
      <div className="basis-1/4">
      <h1 className="text-purple-200 font-bold text-4xl text-center my-5">
        {display_name}'s<br/> Top Songs
      </h1> 
      <nav className=" font-bold bg-stone-900 h-full">
        <ul className={`flex text-green-800`}>
          <li className={`flex-1 flex justify-center content-center `}>
          {/* u have to define string with default style and add
          to it if isActive is true with the appropriate styles */}
          
            <NavLink to="month" 
            className={({isActive})=>isActive ? "text-stone-900 bg-green-900 text-center w-full text-2xl align-middle truncate" : "text-center w-full text-2xl align-middle truncate"}>
              Month
            </NavLink>
          </li>
          <li className={`flex-1 flex justify-center `}>
            <NavLink to="sixmonths" 
            className={({isActive})=>isActive ? "text-stone-900 bg-green-900 text-center w-full text-2xl truncate" : "text-center w-full text-2xl truncate"}>
              Six Months
            </NavLink>
          </li>
          <li className={`flex-1 flex justify-center` }>
            <NavLink to="alltime"
            className={({isActive})=> isActive ? "text-stone-900 bg-green-900 text-center w-full text-2xl" : "text-center w-full text-2xl"}>
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