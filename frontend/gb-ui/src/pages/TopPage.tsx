import {useState} from "react"
import {Outlet} from "react-router-dom";
import SongPreviewModal from "../components/modals/SongPreviewModal";

import { ListenOnClickContextType, SongPreviewInfo } from "../interfaces";

export default function TopPage(){

  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:""});

  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined){
    if(songPreviewInfo === undefined || songPreviewInfo === null){
      console.log("Song preview is undefined");
      return
    }
    setModalSongPreviewInfo(songPreviewInfo);
    setShowModal(true);
    return;
  }

  return(
    <div className="h-[calc(100%-3.5rem)] w-full flex flex-col">

      <Outlet context={{handleListenOnClick} satisfies ListenOnClickContextType}/>

      {showModal ?
          <SongPreviewModal 
            setShowModal={setShowModal} 
            songPreviewInfo={modalSongPreviewInfo}
          />
        :
          null
      }
    </div>
  )
}
