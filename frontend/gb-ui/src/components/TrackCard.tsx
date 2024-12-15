import {Link} from "react-router-dom"
import { ITrack, SongPreviewInfo, } from "../interfaces"

import listenSvg from '../assets/listen.svg';
import findRecsSvg from '../assets/search-list.svg';
import SaveButton from "./SaveButton";


function handleDefaultModalError(songPreviewInfo:SongPreviewInfo | undefined ){
  if(songPreviewInfo && songPreviewInfo.name && songPreviewInfo.artist && songPreviewInfo.url){
    console.log("no modal was given to handle preview: "+ songPreviewInfo.name+" "+songPreviewInfo+" "+songPreviewInfo.url);
  }
}

interface TrackCardParams{
  track : ITrack,
  popModal: (songPreviewInfo:SongPreviewInfo | undefined) =>void,
  hideSaveButton: boolean,
}

export default function TrackCard({track,popModal=handleDefaultModalError,hideSaveButton=false}:TrackCardParams){

  const defaultTrackCardOptionString  = "flex-1 bg-stone-200 hover:bg-green-700 text-black flex p-1 text-center "
    + "items-center justify-center font-bold text-lg shrink-0  h-full"

  const disabledTrackCardOptionString  = "flex-1 bg-stone-600 text-black flex p-1 text-center "
    + "items-center justify-center font-bold text-lg shrink-0  h-full"


  return(
    <div className="flex bg-stone-800 my-1 rounded-xl h-14 ">
        <a className=" h-14 w-14 shrink-0" target="_blank" href={"https://open.spotify.com/track/"+track.id}>
          <img className="bg-fill" src={track.image} />
        </a>

        <div className="flex basis-7/12 flex-col shrink-1 grow-1 pl-2 overflow-hidden">
          <div className="flex-1 text-stone-200 font-bold overflow-x-hidden truncate">{track.name}</div> 
          <div className="flex-1 text-stone-300 overflow-x-hidden truncate">{track.artist}</div>
        </div>

        <div className=" flex basis-4/12 shrink-0 w-fit justify-between items-center ">

          {track.url!==null && track.url !==undefined ?
            <button
              onClick={()=>popModal({name:track.name,artist: track.artist,url: track.url?track.url :"",image:track.image?track.image:""})}
              className={defaultTrackCardOptionString}
            >
              <img src={listenSvg} alt="listen" className="w-8"/>
            </button>
          :
            <button
              className={disabledTrackCardOptionString}
              disabled
              >
                <img src={listenSvg} alt="listen" className="w-8"/>
              </button>
          }

           {!hideSaveButton && <SaveButton trackInfo={track}/>}

          <Link to={`/track/${track.id}`}
            className={defaultTrackCardOptionString}
          >
            <img src={findRecsSvg} alt="recs" className="w-8"/>
          </Link>


        </div>
      </div> 
  )
}