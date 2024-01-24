//import { requestAuth } from "../api";

import { redirect } from "react-router-dom";

export async function loader(){
  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token == ""){
    return redirect("/link-search")
  }
  return redirect("/top")
}

export default function HomePage(){
  
  return(
    <div className="flex justify-center items-center mt-32 text-2xl">
      <a className="bg-green-900 text-white border-white border-2 p-4 rounded-sm"href="api/auth/requestauth">Log In With Spotify</a>

    </div>
  )
}