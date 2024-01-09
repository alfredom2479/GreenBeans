import { useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { requestMySpotifyAccount } from "../api";

export async function loader(){
  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return "";
  }

  try{
    const data = await requestMySpotifyAccount(access_token);
    console.log(data);
    const display_name:string = data.display_name;
    return display_name;
  }catch(err){
    console.log("No user is logged in");
    console.log(err);
    return "";
  }
  
}

export default function NavBar(){

  const [currUser, setCurrUser] = useState<string>("")

  const loaderData = useLoaderData();

  useEffect(()=>{
    if(typeof loaderData ==="string" && loaderData !== ""){
      setCurrUser(loaderData);
    }
  },[loaderData])

  return (
    <div className="max-h-screen h-screen flex flex-col items-center justify-center">
      <Outlet/>
      <div className="flex fixed bottom-0 left-0 right-0 h-16 border-t-2 border-white">
        <a 
          href="/real-top/month"
          className="flex basis-32 items-center justify-center  bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-r-2 hover:border-purple-600"
          >Top
        </a>
        <a 
          href="/saved/0"
          className="flex basis-32 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white hover:border-purple-600"
          >Saved
        </a>
        <a 
          href="/link-search"
          className="flex basis-32 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 border-r-2 text-xl font-bold  mb-0 text-center border-white border-l-2 hover:border-purple-600"
          >search
        </a>
        {
          !currUser || currUser==="" ?
            <button className=" bg-green-900 text-white border-white border-l-2 border-t-2 rounded-sm">
              Log In
            </button>
          :
            <p className="flex justify-center items-center basis-32 grow text-center font-bold text-lg bg-green-900 text-white border-white">
              {currUser}
            </p>
        }
        
      </div>
    </div>
  )
}