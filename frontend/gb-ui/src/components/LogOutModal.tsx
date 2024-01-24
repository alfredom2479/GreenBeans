import { Dispatch,SetStateAction } from "react"
import {useNavigate } from "react-router-dom";

export default function LogOutModal({setShowModal}: {setShowModal: Dispatch<SetStateAction<boolean>>}){

  const navigate = useNavigate();

  function handleLogOut(){
    setShowModal(false);
    localStorage.clear();
    navigate("/");
    window.location.reload();
  }
  
  return(
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
                    <button onClick={()=>{setShowModal(false)}} className="bg-gray-700 text-white p-4 m-4 rounded-md">nah</button>
                  </div>
                </div>
              </div>

          </div>
  )
}