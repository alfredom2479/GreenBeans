import { Dispatch, SetStateAction } from "react"
import { NavLink } from "react-router-dom"

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
                <div className="text-4xl font-bold mb-6">
                  {currUser}
                </div> 
              : 
                null 
            }

            <NavLink 
              to="link-search"
              className="my-4"
              >Link-Search
            </NavLink>
            
            {currUser !== null ? 
            <>
              <NavLink
                to="saved"
                className="my-4"
                >Saved Tracks
              </NavLink> 
              <NavLink
                to="top"
                className="my-4"
                >Top Tracks
              </NavLink>
            </>   
            :
            null
          }
          {
            currUser == null ?
              <a className= "flex justify-center items-center basis-32 grow text-center font-bold "
                href="/api/auth/requestauth">
                  Log In
              </a>
              :
              <button className="flex justify-center items-center basis-32 grow text-center font-bold text"
                onClick={()=>{setShowLogOutModal(true)}}>
                  Log Out
                </button>

          }

            
          </nav>
        </div>
    </div>
  )
}