import { useEffect, useState } from "react";
import { Outlet, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import {  requestMySpotifyAccount } from "../../api";
import LogOutModal from "../modals/LogOutModal";

import hamburgerSvg from '../../assets/hamburger3.svg';

import spotifyLogo from "../../assets/spotify_logo.png";
import SideBar from "../navigation/SideBar";
import { deleteAllStores, openIDB } from "../../idb";

export async function loader(){
  const access_token:string|null = localStorage.getItem("access_token");

  openIDB();

  if(!access_token || access_token===""){
    const cleared_idb:string|null = localStorage.getItem("cleared_idb");
    if(cleared_idb === null){
      await deleteAllStores();
      localStorage.setItem("cleared_idb","true");
    }

    return null;
  }

  const username = localStorage.getItem("greenbeans_user");
  if(username !== null && username !== ""){
    return username;
  }

  try{
    const data = await requestMySpotifyAccount(access_token);
    if(data && data.display_name){
      deleteAllStores();
      localStorage.setItem("greenbeans_user",data.display_name);
      return data.display_name;

    }
  }catch(err){
    return null;
  }
  return null;
}

export default function NavBar(){

  const [currUser, setCurrUser] = useState<string|null>("")
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const [pageName, setPageName] = useState<string>("Link-Search");

  const loaderDataUsername = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{
    if(location.pathname.includes("top")){
      setPageName("Top")
    }
    else if(location.pathname.includes("saved")){
      setPageName("Saved")
    }
    else if(location.pathname.includes("track")) {
      setPageName("Recs")
    }
    else{
      setPageName("Link")
    }
    
  },[location])

  useEffect(()=>{

    if(typeof loaderDataUsername ==="string" ){
      setCurrUser(loaderDataUsername);
    }
    else{
      setCurrUser(null);
    } 
  },[loaderDataUsername,navigate])


  return (
    <div className="h-[100dvh] flex flex-col items-center ">

      <div className="h-14 flex items-center justify-between  w-full px-2">
        <button className="flex-1" onClick={()=>{setShowSideBar(true)}}>
          <img src={hamburgerSvg}  className="flex-1 h-10"/>
        </button>
        <a href='https://spotify.com' target='_blank' className="flex flex-1 justify-center">
          <img src={spotifyLogo} className='flex-1 h-10 grow-0' />
        </a>
        <h1 className="flex-1  text-white font-bold text-2xl text-right">
          {pageName}
        </h1>
      </div>
      <Outlet/>
      {showSideBar ? 
      <SideBar 
      setShowSidebar={setShowSideBar} 
      currUser={currUser} 
      setPageName={setPageName}
      setShowLogOutModal={setShowLogOutModal}/>
      : 
      null}
      { showLogOutModal ? <LogOutModal setShowModal={setShowLogOutModal}/> : null }
    </div>
  )

}
