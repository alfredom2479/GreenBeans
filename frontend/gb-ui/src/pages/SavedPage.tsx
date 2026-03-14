import {useState} from 'react';
import { Outlet, redirect } from "react-router-dom";

import SongPreviewModal from "../components/modals/SongPreviewModal";
import { ITrack, ListenOnClickContextType, SongPreviewInfo } from "../interfaces";

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
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
  const [modalTrackList, setModalTrackList] = useState<ITrack[]>([]);
  const [modalOnTrackSaved, setModalOnTrackSaved] = useState<((track: ITrack) => void) | undefined>(undefined);

  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined, index?: number, trackList?: ITrack[], onTrackSavedFromList?: (track: ITrack) => void){
    if(songPreviewInfo === undefined){
      console.log("Song preview info is undefined");
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    if (trackList && trackList.length > 0 && index !== undefined) {
      setModalTrackList(trackList);
      setModalCurrentIndex(index);
      setModalOnTrackSaved(() => onTrackSavedFromList);
    } else {
      setModalTrackList([]);
      setModalCurrentIndex(0);
      setModalOnTrackSaved(undefined);
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
        currentIndex={modalCurrentIndex}
        onIndexChange={setModalCurrentIndex}
        trackList={modalTrackList.length > 0 ? modalTrackList : undefined}
        hideSaveButton={true}
        onTrackSaved={modalOnTrackSaved}
      />
      :
      null
    }
    </div>
  )
}