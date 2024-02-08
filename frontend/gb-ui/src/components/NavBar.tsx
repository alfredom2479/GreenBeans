import { useEffect, useState } from "react";
import { Outlet, useLoaderData, useNavigate} from "react-router-dom";
import { requestMySpotifyAccount } from "../api";
import LogOutModal from "./LogOutModal";
import NavbarItem from "./NavBarItem";

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
    console.log(data);
  }catch(err){
    console.log(err);
  }
  return "[ERROR]";
}

export default function NavBar(){

  const [currUser, setCurrUser] = useState<string>("")
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);

  const loaderData = useLoaderData();
  const navigate = useNavigate();

  const accountStatusStyleString = "flex justify-center items-center basis-32 "+
    "grow text-center font-bold text-lg bg-green-900 text-white border-white "+
    "border-l-2 border-t-2"

  useEffect(()=>{

    if(typeof loaderData ==="string" && loaderData !== ""){
      setCurrUser(loaderData);
    }
    else{
      navigate("/link-search");
    } 
  },[loaderData,navigate])


  return (
    <div className="max-h-screen h-screen flex flex-col items-center justify-center">
      <Outlet/>
      <div className="flex fixed bottom-0 left-0 right-0 h-16">
        <NavbarItem 
          name="top"
          path="/top/month" 
          extraStyle="border-r-2 border-t-2"
        />
        <NavbarItem 
          name="saved"
          path="/saved/0" 
          extraStyle="border-2 border-b-0"
        />
        <NavbarItem 
          name="search"
          path="/link-search" 
          extraStyle="border-2 border-b-0"
        />
        {
          !currUser || currUser==="" ?
            <a className={accountStatusStyleString}
            href="api/auth/requestauth">
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