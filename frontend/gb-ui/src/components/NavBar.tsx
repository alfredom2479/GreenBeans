import { useEffect, useState } from "react";
import { Outlet, useLoaderData,  NavLink, useNavigate} from "react-router-dom";
import { requestMySpotifyAccount } from "../api";
import LogOutModal from "./LogOutModal";

export async function loader(){
  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return "";
  }

  try{
    const data = await requestMySpotifyAccount(access_token);
    if(data && data.display_name){
      return data.display_name;
    }
    return null;
  }catch(err){
    console.log("No user is logged in:"+err);
    return "";
  }
}

export default function NavBar(){

  const [currUser, setCurrUser] = useState<string>("")
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);

  const loaderData = useLoaderData();

  const navigate = useNavigate();

  useEffect(()=>{
    if(typeof loaderData ==="string" && loaderData !== ""){
      setCurrUser(loaderData);
      navigate("top");
    }
    else{
      navigate("/link-search");
    } 
  },[loaderData,navigate])


  return (
    <div className="max-h-screen h-screen flex flex-col items-center justify-center">
      <Outlet/>
      <div className="flex fixed bottom-0 left-0 right-0 h-16 border-t-2 border-white">
        <NavLink 
          to="/top/month"
          className="flex basis-32 items-center justify-center  bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-r-2 hover:border-purple-600"
          >Top
        </NavLink>
        <NavLink 
          to="/saved/0"
          className="flex basis-32 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white hover:border-purple-600"
          >Saved
        </NavLink>
        <NavLink 
          to="/link-search"
          className="flex basis-32 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 border-r-2 text-xl font-bold  mb-0 text-center border-white border-l-2 hover:border-purple-600"
          >search
        </NavLink>
        {
          !currUser || currUser==="" ?
            <a className="flex justify-center items-center basis-32 grow texxt-center font-bold text-lg bg-green-900 text-white border-white "
            href="api/auth/requestauth">
              Log In
            </a>
          :
            <button className="flex justify-center items-center basis-32 grow text-center font-bold text-lg bg-green-900 text-white border-white"
              onClick={()=>{setShowLogOutModal(true)}}>
              {currUser}
            </button>
        }
        
      </div>
      { showLogOutModal ? <LogOutModal setShowModal={setShowLogOutModal}/> : null }
    </div>
  )
}