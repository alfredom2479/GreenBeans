import {useState} from "react"
import {Outlet} from "react-router-dom";
import TopNavItem from "../components/TopNavItem";
import SongPreviewModal from "../components/SongPreviewModal";

import { ListenOnClickContextType } from "../interfaces";

export default function TopPage(){

  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewUrl, setModalSongPreviewUrl] = useState<string>("")

  function handleListenOnClick(songPreviewUrl:string|undefined){
    if(songPreviewUrl === undefined || songPreviewUrl === null){
      console.log("Song preview url is undefined");
      return
    }
    setModalSongPreviewUrl(songPreviewUrl);
    setShowModal(true);
    console.log(modalSongPreviewUrl);
    return;
  }

  return(
    <div className="h-full pb-16 flex flex-col">
      <div className="basis-1/4 flex flex-col ">
      <h1 className="basis-1/2 text-purple-200 font-bold text-4xl text-center my-5">
        Your Top Songs
      </h1> 
      <nav className=" basis-1/2 font-bold bg-stone-800 ">
        <ul className={`flex text-white`}>
          <TopNavItem path="month" name="month"/>
          <TopNavItem path="sixmonths" name="six months"/>
          <TopNavItem path="alltime" name="years+"/>
        </ul>
      </nav>
      </div>
      <Outlet context={{handleListenOnClick} satisfies ListenOnClickContextType}/>
      {showModal ?
          <SongPreviewModal 
            setShowModal={setShowModal} 
            songPreviewUrl={modalSongPreviewUrl}
          />
        :
          null
      }
    </div>
  )
}
