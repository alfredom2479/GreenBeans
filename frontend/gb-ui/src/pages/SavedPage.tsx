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
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:"",image:""});
  const [modalSongList, setModalSongList] = useState<SongPreviewInfo[]>([]);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);

  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined, list?: SongPreviewInfo[], index?: number){
    if(songPreviewInfo === undefined){
      console.log("Song preview info is undefined");
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    if (list && list.length > 0 && index !== undefined) {
      setModalSongList(list);
      setModalCurrentIndex(index);
    } else {
      setModalSongList([]);
      setModalCurrentIndex(0);
    }
    setShowModal(true);
  }
  return(
    <div className="h-[calc(100%-3.5rem)] w-full flex flex-col">

      <Outlet context={{handleListenOnClick} satisfies ListenOnClickContextType}/>

      {showModal ?
      <SongPreviewModal
        setShowModal={setShowModal}
        songPreviewInfo={modalSongPreviewInfo}
        songList={modalSongList.length > 0 ? modalSongList : undefined}
        currentIndex={modalCurrentIndex}
        onIndexChange={setModalCurrentIndex}
      />
      :
      null
    }
    </div>
  )
}