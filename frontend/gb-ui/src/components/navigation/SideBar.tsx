import { Dispatch, SetStateAction } from "react"
import SideBarNavItem from "./SidebarNavItem"

interface params{
  setShowSidebar: Dispatch<SetStateAction<boolean>>,
  currUser: string|null,
  setPageName: Dispatch<SetStateAction<string>>
  setShowLogOutModal: Dispatch<SetStateAction<boolean>>
}

export default function SideBar({setShowSidebar, currUser, setShowLogOutModal}:params){
  return (
    <div className="z-10 fixed h-full w-full left-0 top-0 flex bg-[rgba(0,0,0,.4)]"
      onClick={()=>{setShowSidebar(false)}}>
        <div className="bg-stone-800 w-64 h-full p-2 ">
          <nav className="flex flex-col text-white items-center text-2xl">
            {currUser !== null ? 
                <div className="text-3xl text-center font-bold mb-6 w-60 truncate">
                  {currUser}
                </div> 
              : null }
            <SideBarNavItem path="/link-search" name="Link-Search" />
            {currUser !== null ? 
                <>
                  <SideBarNavItem path="/saved" name="My Saved Tracks"/>
                  <SideBarNavItem path="/top" name="My Top Tracks"/>
                </>   
              : null }
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