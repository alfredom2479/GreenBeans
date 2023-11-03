import {Outlet, redirect, useLoaderData} from "react-router-dom";

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

  const accountData = useLoaderData();
  let display_name:string = "???"
  if(typeof accountData === "string"){
    display_name = accountData
  }

  return(
    <>
      <h1>Welcome {display_name}</h1>
      <nav>
        <ul>
          <li>
            <button>top of this week</button>
          </li>
          <li>
            <button>top of 6 months</button>
          </li>
          <li>
            <button>top of all time</button>
          </li>
        </ul>
      </nav>
      <Outlet/>

    </>
  )
}