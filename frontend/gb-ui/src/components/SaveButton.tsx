import { useEffect, useState } from "react";

import { TrackSaveState } from "../interfaces"

import addTrackSvg from '../assets/plus2.svg';
import trackSavedSvg from '../assets/check.svg';
import { saveSpotifyTrack } from "../api";

interface SaveButtonParams{
  trackSaveState: TrackSaveState,
  id: string
}

export default function SaveButton({trackSaveState, id}:SaveButtonParams){

  const [saveButton,setSaveButton] = useState(
    <button
      className="flex-1 bg-neutral-600 text-black flex p-1 text-center items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"
      disabled
    >
      <img src={addTrackSvg} alt="unsaveable" className="w-8"/>
    </button>
  )

    useEffect(()=>{
      async function handleSaveOnClick(){
        setSaveButton(
          <button 
            className="flex-1 bg-green-400 text-black flex p-1 text-center items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"
            disabled
          >
            <img src={trackSavedSvg} alt="saved" className="w-8"/>
          </button>
        )
        

        try{
          const responseData = await saveSpotifyTrack(id);
          if(!responseData ){
            setSaveButton(
              <button
                className="flex-1 bg-stone-200 text-black flex p-1 text-center items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"
                onClick={()=>handleSaveOnClick()}
              >
                <img src={addTrackSvg} alt="save" className="w-8"/>
              </button>
            )
            console.log("Save track request FAILED!");
          }
          else{
            setSaveButton(
              <button 
                className="flex-1 bg-green-400 text-black flex p-1 text-center items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"
                disabled
              >
                <img src={trackSavedSvg} alt="saved" className="w-8"/>
              </button>
            )
          }
        }catch(err){
          console.log("Error saving track");
          console.log(err);
        }
    }

    if(trackSaveState === TrackSaveState.Saveable){
      setSaveButton(
        <button
          className="flex-1 bg-stone-200 text-black flex p-1 text-center items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"
          onClick={()=>handleSaveOnClick()}
        >
          <img src={addTrackSvg} alt="save" className="w-8"/>
      </button>
      )
    }
    else if(trackSaveState === TrackSaveState.Saved){
      setSaveButton(
        <button 
          className="flex-1 bg-green-400 text-black flex p-1 text-center items-center justify-center font-bold text-lg rounded-3xl m-2 shrink-0  w-10"
          disabled
        >
          <img src={trackSavedSvg} alt="saved" className="w-8"/>
        </button>
      )
    }

  },[id,trackSaveState])
  return (
    <>
      {saveButton}
    </>
  )
}