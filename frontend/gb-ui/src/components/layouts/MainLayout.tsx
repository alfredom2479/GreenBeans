import { useEffect, useState } from "react";
import { Outlet, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import {  requestMySpotifyAccount } from "../../api";
import LogOutModal from "../modals/LogOutModal";
import hamburgerSvg from '../../assets/hamburger3.svg';
import spotifyLogo from "../../assets/spotify_logo.png";
import SideBar from "../navigation/SideBar";
import SideBarNavItem from "../navigation/SidebarNavItem";
//import { deleteAllStores, openIDB } from "../../idb";
import { clearAllDexieTables } from "../../utils";
import userIcon from "../../assets/user-svgrepo-com.svg";
import greenBeansLogo from "../../assets/beans-svgrepo-com.svg";
//Loader checks for username locally, then on spotify, then clears indexedDB if needed.
export async function loader(){

  //openIDB();

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    const cleared_idb:string|null = localStorage.getItem("cleared_idb");

    if(cleared_idb === null){
      //await deleteAllStores();
      await clearAllDexieTables();
      localStorage.setItem("cleared_idb","true");
    }
    return null;
  }

  const username:string|null = localStorage.getItem("greenbeans_user");
  if(username !== null && username !== "") return username;
  
  try{
    const data = await requestMySpotifyAccount(access_token);
    if(data && data.display_name){
      //await deleteAllStores();
      await clearAllDexieTables();
      localStorage.setItem("greenbeans_user",data.display_name);
      return data.display_name;
    }
    return null
  }catch(err){
    console.log("no username found");
    return null
  }
  
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
    const urlPath:string = location.pathname;
    if (urlPath.includes("top")) setPageName("Top")
    else if (urlPath.includes("saved")) setPageName("Saved")
    else if (urlPath.includes("track")) setPageName("Track")
    else setPageName("Link")
  },[location])

  useEffect(()=>{
    typeof loaderDataUsername ==="string" ? setCurrUser(loaderDataUsername) : setCurrUser(null);
  },[loaderDataUsername,navigate])


  return (
    <div className="flex">    
    <div className="hidden lg:block bg-stone-900 pt-10 w-80 h-[100dvh] border-r border-stone-400 mr-1 p-2">
      <nav className="flex flex-col text-white items-center text-2xl">

        <img className="w-10 mb-5" src={greenBeansLogo}/>
        {currUser !== null ? 
          <div className="flex justify-center border-b mb-6 pb-2 border-stone-400 w-full">
            <img className="flex w-8 mr-2" src={userIcon}/>
            <div className="flex text-3xl  font-bold truncate ">
              {currUser}
            </div> 
          </div> 
        : null}
        <SideBarNavItem path="/" name="Use Share Link" isDisabled={false}/>
        <SideBarNavItem path="/saved" name="My Saved Tracks" isDisabled={currUser === null}/>
        <SideBarNavItem path="/top" name="My Top Tracks" isDisabled={currUser === null}/>
        {currUser == null ?
          <a className="flex justify-center items-center basis-32 grow text-center font-bold hover:text-green-400"
            href="/api/auth/requestauth">
              Log In
          </a>
        :
          <button className="flex justify-center items-center basis-32 grow text-center font-bold hover:text-green-400"
            onClick={()=>{setShowLogOutModal(true)}}>
              Log Out
          </button>
        }
      </nav>
    </div>
      <div className="h-[100dvh] flex flex-col items-center w-full ">
        <div className="h-14 flex items-center justify-between w-full px-2">
        <div className="flex-1">
        <button className="flex-1 lg:hidden"
            onClick={()=>{setShowSideBar(true)}} >
              <img className="flex-1 h-10"
                src={hamburgerSvg}/>
          </button>
          <div className="hidden lg:block text-green-600 text-4xl ">GreenBeans</div>
        </div>
        <div className="flex flex-1 justify-center items-center">
          <div className="text-stone-400 pr-2">Powered by </div>
          <a className="flex h-6 w-6"
            href='https://spotify.com' 
            target='_blank' >
              <img className='flex-1 h-6 grow-0'
                src={spotifyLogo} />
          </a>
        </div>
        
        <h1 className="flex-1 text-white font-bold text-3xl text-right">
          {pageName}
        </h1>
      </div>
      <Outlet/>
      {showSideBar ? 
          <SideBar 
            setShowSidebar={setShowSideBar} 
            currUser={currUser} 
            setPageName={setPageName}
            setShowLogOutModal={setShowLogOutModal}
          />
        : null}
      { showLogOutModal ? <LogOutModal setShowModal={setShowLogOutModal}/> : null }
    </div>
    </div>
  )

}
