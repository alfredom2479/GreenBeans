import { useEffect, useState } from "react";
import { Outlet, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import {  requestMySpotifyAccount } from "../api";
import LogOutModal from "./LogOutModal";
//import NavbarItem from "./NavBarItem";

/*
import linkSvg from '../assets/link.svg';
import savedSvg from '../assets/saved.svg';
import topSvg from '../assets/top.svg';
*/
import hamburgerSvg from '../assets/hamburger3.svg';

import spotifyLogo from "../assets/spotify_logo.png";
import SideBar from "./SideBar";

export async function loader(){
  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return "[ERROR]";
  }

  const username = localStorage.getItem("greenbeans_user");
  if(username !== null && username !== ""){
    return username;
  }

  try{
    const data = await requestMySpotifyAccount(access_token);
    if(data && data.display_name){
      localStorage.setItem("greenbeans_user",data.display_name);
      return data.display_name;

    }
  }catch(err){
    return "[ERROR]";
  }
  return "[ERROR]";
}

export default function NavBar(){

  const [currUser, setCurrUser] = useState<string|null>("")
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const [pageName, setPageName] = useState<string>("Link-Search");

  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();

  /*const accountStatusStyleString = "flex justify-center items-center basis-32 "+
    "grow text-center font-bold text-lg bg-green-900 text-white "+
    "rounded-3xl mr-2"
    */


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

    if(typeof loaderData ==="string" && loaderData !== "[ERROR]"){
      setCurrUser(loaderData);
    }
    else{
      localStorage.clear()
      setCurrUser(null);
      //navigate("/");
    } 
  },[loaderData,navigate])

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

  /*
  return (
    <div className="max-h-screen h-screen flex flex-col items-center justify-center">
      <Outlet/>
      <nav className="flex fixed bottom-2 left-0 right-0 h-12 justify-between">
        {currUser === null ? null :
          <NavbarItem 
            name="top"
            path="/top" 
            svgPath={topSvg}
        />
        }
        {currUser === null ? null :
          <NavbarItem 
            name="saved"
            path="/saved" 
            svgPath={savedSvg}
          />
        }
        <NavbarItem 
          name="search"
          path="/" 
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
      </nav>
      { showLogOutModal ? <LogOutModal setShowModal={setShowLogOutModal}/> : null }
    </div>
  )
  */
}
