import { useEffect, useState } from "react";
import { Outlet, useLoaderData,  NavLink, useNavigate} from "react-router-dom";
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

export async function action(){
  console.log("an action has occured");
}

export default function NavBar(){

  const [currUser, setCurrUser] = useState<string>("")
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);

  const loaderData = useLoaderData();

  const navigate = useNavigate();

  useEffect(()=>{
    if(typeof loaderData ==="string" && loaderData !== ""){
      setCurrUser(loaderData);
      navigate("real-top");
    }
    else{
      navigate("/link-search");
    } 
  },[loaderData,navigate])


  function handleLogOut(){
    console.log("u clicked yeh bruh");
    setShowLogOutModal(false);
    localStorage.clear();
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="max-h-screen h-screen flex flex-col items-center justify-center">
      <Outlet/>
      <div className="flex fixed bottom-0 left-0 right-0 h-16 border-t-2 border-white">
        <NavLink 
          to="/real-top/month"
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
      {
        showLogOutModal ?
          <div className="z-10 fixed h-full w-full left-0 top-0 pt-48 bg-[rgba(0,0,0,.4)]"
            >
              <div className="bg-gray-50 m-auto w-10/12 flex justify-center">
                <div className="flex flex-col text-xl">
                  <div className="font-bold">
                    u wanna log out?
                  </div>
                  <div>
                    when you log back in, on the Permissions Page, Click 'not you?' link to switch accounts.
                    </div>
                  <div className="flex justify-center">
                    
                    <button type="submit" onClick={()=>{handleLogOut()}}className="bg-red-950 text-white p-4 m-4 rounded-md">yeh</button>
                    <button onClick={()=>{setShowLogOutModal(false)}} className="bg-gray-700 text-white p-4 m-4 rounded-md">nah</button>
                  </div>
                </div>
              </div>

          </div>
        :
        null

      }
    </div>
  )
}