import {useState} from 'react';
import { Outlet, redirect } from "react-router-dom";

import SongPreviewModal from "../components/modals/SongPreviewModal";
import { ListenOnClickContextType, SongPreviewInfo } from "../interfaces";

import type {Params} from "react-router-dom";

//import spotifyLogo from "../assets/spotify_logo.png";

interface URLParams{
  params:Params
}

export async function loader({params}:URLParams){

  if(!params.page){
    return redirect("/saved/0");
  }

  return null;
}

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
    <div className="h-[calc(100%-3.5rem)] w-full flex flex-col">

      
      {/* <div className="h-14 shrink-0 p-2 flex items-center justify-between text-right mx-2">
        <a href='https://spotify.com' target='_blank'>
          <img src={spotifyLogo} className='flex-1 h-10 grow-0' />
        </a>
        <h1 className="flex-1 basis-1/2 text-white font-bold text-4xl ">
          Saved
        </h1>
      </div>
 */}
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