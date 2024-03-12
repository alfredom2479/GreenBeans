import {useState} from 'react';
import { Outlet } from "react-router-dom";

import SongPreviewModal from "../components/SongPreviewModal";
import { ListenOnClickContextType } from "../interfaces";

export default  function SavedPage(){

  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewUrl, setModalSongPreviewUrl] = useState<string>("");

  function handleListenOnClick(songPreviewUrl:string|undefined){
    if(songPreviewUrl === undefined){
      console.log("Song preview url is undefined");
      return;
    }
    setModalSongPreviewUrl(songPreviewUrl);
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
        songPreviewUrl= {modalSongPreviewUrl}
      />
      :
      null
    }
    </div>
  )
}