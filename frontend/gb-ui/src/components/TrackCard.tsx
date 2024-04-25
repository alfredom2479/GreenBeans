import {Link} from "react-router-dom"
import { ITrack, SongPreviewInfo, TrackSaveState } from "../interfaces"

import listenSvg from '../assets/listen.svg';
import findRecsSvg from '../assets/search-list.svg';
import SaveButton from "./SaveButton";


function handleDefaultModalError(prevInfo:SongPreviewInfo ){
  console.log("no modal was given to handle preview: "+ prevInfo.name+" "+prevInfo+" "+prevInfo.url);
}

export default function TrackCard({id,name,artist,image,url,popModal=handleDefaultModalError,trackSaveState=TrackSaveState.CantSave}:ITrack){

  const defaultTrackCardOptionString  = "flex-1 bg-stone-200 hover:bg-green-400 text-black flex p-1 text-center "
    + "items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"

  const disabledTrackCardOptionString  = "flex-1 bg-neutral-600 text-black flex p-1 text-center "
    + "items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"


  return(
    <>
    <div className="flex bg-stone-800 my-1 rounded-xl h-14">
        <div 
        className=" h-14 w-14 shrink-0">
        <img className="bg-fill" src={image} />
        </div>

        <div className="flex basis-7/12 flex-col shrink-1 grow-1 pl-2 overflow-hidden">
          <div className="flex-1 text-stone-200 font-bold overflow-x-hidden truncate">{name}</div> 
          <div className="flex-1 text-stone-300 overflow-x-hidden truncate">{artist}</div>
        </div>

        <div className=" flex basis-4/12 shrink-0 w-fit justify-evenly">

          <Link to={`/track/${id}`}
          // className="flex-1 bg-green-950 text-white basis-1/6 p-1 text-center flex items-center justify-center font-bold text-lg rounded-3xl"
          className={defaultTrackCardOptionString}
          >
            <img src={findRecsSvg} alt="recs" className="w-8"/>
          </Link>

          {url!==null && url !==undefined && name !==null && name !== undefined && artist !== null && name !== undefined ?
            <button
              onClick={()=>popModal({name:name,artist:artist,url:url})}
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

           <SaveButton id={id} trackSaveState={trackSaveState}/>

        </div>
      </div> 
    </>
  )
}