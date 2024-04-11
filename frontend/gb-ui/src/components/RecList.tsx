//import { useEffect } from "react"
import { ITrack, SongPreviewInfo, } from "../interfaces"
import TrackCard from "./TrackCard"
//import { requestSaveStatus } from "../api"

interface CompParams{
  listTracks: ITrack[],
  handleOnClick: (songPreviewInfo:SongPreviewInfo|undefined)=>void
}

export default function RecList({listTracks, handleOnClick}:CompParams){

  /*
 useEffect(()=>{

  const access_token: string|null = localStorage.getItem("access_token");

  const checkSavedStatus = async ()=>{
    const saveStatusData =  await requestSaveStatus(access_token, listTracks);
    console.log(saveStatusData);
    
    if(Array.isArray(saveStatusData) &&  saveStatusData.length === listTracks.length){
    console.log("it is an array!");
     for(let i=0; i <listTracks.length; i++){
      //u need to change this 
      if(saveStatusData[i] === false){
        listTracks[i].trackSaveState= TrackSaveState.Saveable;
      }
      else{
        listTracks[i].trackSaveState = TrackSaveState.Saved;
        console.log(listTracks[i]);
      }
     } 
    }
    else{
      for(let i=0; i <listTracks.length; i++){
        listTracks[i].trackSaveState= TrackSaveState.Saveable;
      }
    }
  }

  checkSavedStatus();
 },[listTracks]) 
 */
  
  return (
    <div className="h-full overflow-y-scroll">
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
    </div>
  )
}