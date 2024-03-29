import {Link} from "react-router-dom"
import { ITrack, SongPreviewInfo, TrackSaveState } from "../interfaces"
import { saveSpotifyTrack } from "../api"

import listenSvg from '../assets/listen.svg';
import findRecsSvg from '../assets/search-list.svg';
import addTrackSvg from '../assets/plus2.svg';
import trackSavedSvg from '../assets/check.svg';

function handleDefaultModalError(prevInfo:SongPreviewInfo ){
  console.log("no modal was given to handle preview: "+ prevInfo.name+" "+prevInfo+" "+prevInfo.url);
}

export default function TrackCard({id,name,artist,image,url,popModal=handleDefaultModalError,trackSaveState=TrackSaveState.CantSave}:ITrack){

  const defaultTrackCardOptionString  = "flex-1 bg-purple-200 text-black flex p-1 text-center "
    + "items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"

  const trackSavedCardOptionString  = "flex-1 bg-green-200 text-black flex p-1 text-center "
    + "items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"

  const disabledTrackCardOptionString  = "flex-1 bg-neutral-600 text-black flex p-1 text-center "
    + "items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"

  async function handleOnClick(){
    console.log("handleing save...")
    try{
    const responseData = await saveSpotifyTrack(id);
    if(!responseData){
      console.log("Button says the put request was poopoo");
    }
    else{
      console.log(`'${name}' saved`);
    }
  }catch(err){
    console.log("save track onClick error occured");
    console.log(err);
  }
  }

  let saveButton = null;

  if(trackSaveState === TrackSaveState.Saveable){
    saveButton = <button
            className={defaultTrackCardOptionString}
            onClick={()=>handleOnClick()}
          >
              <img src={addTrackSvg} alt="save" className="w-8"/>
            </button>
  }
  else if(trackSaveState === TrackSaveState.CantSave){
    saveButton = <button
              className={disabledTrackCardOptionString}
              disabled
              >
                <img src={addTrackSvg} alt="unsaveable" className="w-8"/> 
              </button>
  }
  else {
    saveButton= <button
      className={trackSavedCardOptionString}
      disabled
      >
        <img src={trackSavedSvg} alt="saved" className="w-8"/>
      </button>
  }

  return(
    <>
    <div className="flex bg-stone-800 my-1 rounded-xl h-14">
        <div 
        className=" h-14 w-14 shrink-0">
        <img className="bg-fill" src={image} />
        </div>

        <div className="flex basis-7/12 flex-col shrink-1 grow-1 pl-2 overflow-hidden">
          <div className="flex-1 text-purple-200 font-bold overflow-x-hidden truncate">{name}</div> 
          <div className="flex-1 text-purple-300 overflow-x-hidden truncate">{artist}</div>
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

          {/** Maybe directly call the api function from here 
           * since u don't need to know what it returns... bc it doesn't return anything.
           * I guess print something on screen on if the request was succesful or not.
           */}

           {saveButton}

          {/*trackSaveState=== TrackSaveState.Saveable?
            <button
            className={defaultTrackCardOptionString}
            onClick={()=>handleOnClick()}
          >
              <img src={addTrackSvg} alt="save" className="w-8"/>
            </button>
          : 
            <button
              className={disabledTrackCardOptionString}
              disabled
              >
                <img src={addTrackSvg} alt="save" className="w-8"/> 
              </button>
          */}
        </div>
      </div> 
    </>
  )
}