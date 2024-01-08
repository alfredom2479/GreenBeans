//import {useState} from 'react';
import { Outlet } from "react-router-dom";


export default  function SavedPage(){

  
  return(
    <div className="max-h-screen flex flex-col">
      <div className="basis-1/4 flex flex-col">
        <h1 className="basis-1/2 text-purple-200 font-bold text-4xl text-center py-3">
          Your Saved Tracks
        </h1>
        <div className="flex">
        </div>
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