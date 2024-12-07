import { Dispatch,SetStateAction } from "react"
import {useNavigate } from "react-router-dom";

export default function LogOutModal({setShowModal}: {setShowModal: Dispatch<SetStateAction<boolean>>}){

  const navigate = useNavigate();

  function handleLogOut(){
    console.log("logging out...")
    setShowModal(false);
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  }
  
  return(
    <div className="z-10 fixed h-full w-full left-0 top-0 pt-48 bg-[rgba(0,0,0,.4)]">
      <div className="bg-gray-50 m-auto w-10/12 flex justify-center p-2 rounded-md text-center">

        <div className="flex flex-col text-xl ">
          <div className="font-bold">Log Out?</div>
          <div className="flex justify-center">
            <button  className="bg-red-950 text-white p-4 m-4 rounded-md"  
              type="submit" 
              onClick={()=>{handleLogOut()}}>
                yes
            </button>
            <button className="bg-gray-700 text-white p-4 m-4 rounded-md"  
              onClick={()=>{setShowModal(false)}} >
                no
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}