import {useState} from 'react';
import { Outlet } from "react-router-dom";

import SongPreviewModal from "../components/SongPreviewModal";
import { ListenOnClickContextType, SongPreviewInfo } from "../interfaces";

export default  function SavedPage(){

  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:""});

  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined){
    if(songPreviewInfo === undefined){
      console.log("Song preview info is undefined");
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    setShowModal(true);
    return;
  }
  return(
    <div className="h-full w-full pb-16 flex flex-col">
      <div className="basis-24 p-2 flex flex-col justify-center items-center">
        <h1 className="basis-1/2 text-white font-bold text-4xl text-center ">
          Saved Tracks
        </h1>
      </div>
      <Outlet context={{handleListenOnClick} satisfies ListenOnClickContextType}/>
      {showModal ?
      <SongPreviewModal
        setShowModal={setShowModal}
        songPreviewInfo= {modalSongPreviewInfo}
      />
      :
      null
    }
    </div>
  )
}