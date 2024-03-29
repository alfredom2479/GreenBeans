import { useEffect, useState } from "react";
import { Outlet, useLoaderData, useNavigate} from "react-router-dom";
import {  requestMySpotifyAccount } from "../api";
import LogOutModal from "./LogOutModal";
import NavbarItem from "./NavBarItem";

import linkSvg from '../assets/link.svg';
import savedSvg from '../assets/saved.svg';
import topSvg from '../assets/top.svg';

export async function loader(){
  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return "[ERROR]";
  }
  try{
    const data = await requestMySpotifyAccount(access_token);
    if(data && data.display_name){
      return data.display_name;
    }
  }catch(err){
    return "[ERROR]";
  }
  return "[ERROR]";
}

export default function NavBar(){

  const [currUser, setCurrUser] = useState<string>("")
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);

  const loaderData = useLoaderData();
  const navigate = useNavigate();

  const accountStatusStyleString = "flex justify-center items-center basis-32 "+
    "grow text-center font-bold text-lg bg-green-900 text-white "+
    "rounded-3xl mr-2"

  useEffect(()=>{

    if(typeof loaderData ==="string" && loaderData !== "[ERROR]"){
      setCurrUser(loaderData);
    }
    else{
      navigate("/");
    } 
  },[loaderData,navigate])


  return (
    <div className="max-h-screen h-screen flex flex-col items-center justify-center">
      <Outlet/>
      <div className="flex fixed bottom-2 left-0 right-0 h-12 justify-between">
        <NavbarItem 
          name="top"
          path="/top/month" 
          extraStyle=""
          svgPath={topSvg}
        />
        <NavbarItem 
          name="saved"
          path="/saved/0" 
          extraStyle=""
          svgPath={savedSvg}
        />
        <NavbarItem 
          name="search"
          path="/" 
          extraStyle=""
          svgPath={linkSvg}
        />
        {
          !currUser || currUser==="" ?
            <a className={accountStatusStyleString}
            href="/api/auth/requestauth">
              Log In
            </a>
          :
            <button className={accountStatusStyleString}
              onClick={()=>{setShowLogOutModal(true)}}>
              {currUser}
            </button>
        }
      </div>
      { showLogOutModal ? <LogOutModal setShowModal={setShowLogOutModal}/> : null }
    </div>
  )
}
