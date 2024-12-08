import { Dispatch, SetStateAction } from "react"
import SideBarNavItem from "./SidebarNavItem"
import greenBeansLogo from "../../assets/beans-svgrepo-com.svg";
import userIcon from "../../assets/user-svgrepo-com.svg";
interface params{
  setShowSidebar: Dispatch<SetStateAction<boolean>>,
  currUser: string|null,
  setPageName: Dispatch<SetStateAction<string>>
  setShowLogOutModal: Dispatch<SetStateAction<boolean>>
}

export default function SideBar({setShowSidebar, currUser, setShowLogOutModal}:params){
  return (
    <div className="z-10 fixed h-full w-full left-0 top-0 flex  bg-[rgba(0,0,0,.4)]"
      onClick={()=>{setShowSidebar(false)}}>
        <div className="bg-stone-800 w-64 h-full p-2 pt-5 ">
          <nav className="flex flex-col text-white items-center text-2xl">
            <img className="w-10 mb-5" src={greenBeansLogo}/>
            {currUser !== null ? 
                <div className="flex justify-center border-b mb-6 pb-2 border-stone-400 w-full">
                  <img className="flex w-8 mr-2" src={userIcon}/>
                  <div className="flex text-3xl font-bold  truncate ">
                      {currUser}
                  </div> 
                </div>
              : null }
            <SideBarNavItem path="/" name="Use Share Link" isDisabled={false}/>
            <SideBarNavItem path="/saved" name="My Saved Tracks" isDisabled={currUser === null}/>
            <SideBarNavItem path="/top" name="My Top Tracks" isDisabled={currUser === null}/>
            {currUser == null ?
                <a className= "flex justify-center items-center basis-32 grow text-center font-bold hover:text-green-400"
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
    </div>
  )
}