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
    return;
  }

  return(
    <div className="h-full w-full pb-16 flex flex-col">
      <div className="basis-1/4 flex flex-col">
      <h1 className="basis-1/2 text-white font-bold text-4xl text-center p-2">
        Top Tracks
      </h1> 
      <nav className="flex flex-col justify-center font-bold bg-black h-16">
        <ul className={`flex text-white`}>
          <TopNavItem path="month" name="30d"/>
          <TopNavItem path="sixmonths" name="6m"/>
          <TopNavItem path="alltime" name="y+"/>
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
