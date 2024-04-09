import {useState} from 'react';
import { Outlet } from "react-router-dom";

import SongPreviewModal from "../components/SongPreviewModal";
import { ListenOnClickContextType, SongPreviewInfo } from "../interfaces";

//import spotifyIcon from "../assets/spotify_icon.png";
import spotifyLogo from "../assets/spotify_logo.png";

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

      <div className="h-14 shrink-0 p-2 flex items-center justify-between text-right mx-2">
        <a href='https://spotify.com' target='_blank'>
          <img src={spotifyLogo} className='flex-1 h-10 grow-0' />
        </a>
        <h1 className="flex-1 basis-1/2 text-white font-bold text-4xl ">
          Saved
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