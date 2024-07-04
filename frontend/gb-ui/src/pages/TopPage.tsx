import {useState} from "react"
import {Outlet, redirect} from "react-router-dom";
import TopNavItem from "../components/navigation/TopNavItem";
import SongPreviewModal from "../components/modals/SongPreviewModal";

import type {Params} from "react-router-dom";

import { ListenOnClickContextType, SongPreviewInfo } from "../interfaces";

//import spotifyLogo from "../assets/spotify_logo.png";

interface LoaderParams{
  params:Params
}

export async function loader({params}:LoaderParams){
  if(!params.range){
    return redirect("/top/month");
  }
  return null;
}

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

      <div className="basis-1/12 flex flex-col">
        {/* <div className="h-14 shrink-0 p-2 flex items-center justify-between text-right mx-2">
          <a href="https://spotify.com" target="_blank">
            <img src={spotifyLogo} className="flex-1 h-10 grow-0"/>
          </a>
          <h1 className=" text-white font-bold text-4xl text-center p-2">
            Top
          </h1>
        </div> */}
         
        <nav className="flex flex-col justify-center font-bold  h-12">
          <ul className={`flex text-stone-200`}>
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
            songPreviewInfo={modalSongPreviewInfo}
          />
        :
          null
      }
    </div>
  )
}
