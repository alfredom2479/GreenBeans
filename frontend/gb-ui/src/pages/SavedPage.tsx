//import {useState} from 'react';
import { Outlet } from "react-router-dom";


export default  function SavedPage(){

  
  return(
    <div className="h-full pb-16 flex flex-col">
      <div className="basis-24 p-4 flex flex-col justify-center items-center">
        <h1 className="basis-1/2 text-purple-200 font-bold text-4xl text-center ">
          Your Saved Tracks
        </h1>
        <div className="flex">
        </div>
      </div>
      <Outlet/>
    </div>
  )
}