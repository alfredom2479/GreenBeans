//import { useEffect } from "react"
//?/import { useEffect, useState } from "react";
import { ITrack, SongPreviewInfo, } from "../interfaces"
import TrackCard from "./TrackCard"
//import { requestSaveStatus } from "../api"

interface CompParams{
  listTracks: ITrack[],
  handleOnClick: (songPreviewInfo:SongPreviewInfo|undefined)=>void,
  isLoadingRecs: boolean
}

export default function RecList({listTracks,handleOnClick,isLoadingRecs}:CompParams){

  /*
*/

console.log(isLoadingRecs);
  
  return (
    <div className="h-full overflow-y-scroll">
      {isLoadingRecs  ? <p className="text-white">Loading...</p> :
      <ul>
        {
          listTracks.map((track)=>{
            return (
              <li key={track.id}>
              <TrackCard
                id={track.id}
                name={track.name}
                artist={track.artist}
                image={track.image}
                url={track.url}
                popModal={handleOnClick}
                trackSaveState={track.trackSaveState}
              />
              </li>
            )
          })
        }
      </ul>
      }
    </div>
  )
}