import {useEffect, useRef, useState} from "react";
import { redirect,useLoaderData} from "react-router-dom";
import type {Params} from 'react-router-dom';
import TrackCard from "../TrackCard";
import { ITrack, TrackSaveState } from "../../interfaces";
import { requestTopTracks } from '../../api';
import { isITrackObject, isTrack } from "../../utils";
import { useHandleListenOnClick } from "../../interfaces";
import { Stores, addTrackList, getTrackList } from "../../idb";

interface TopParams{params:Params}

export async function loader({params}:TopParams){

  let rangeNum:number = 0;
  switch(params.range){
    case "month":
      rangeNum = 0;
      break;
    case "sixmonths":
      rangeNum = 1;
      break;
    default:
      rangeNum=2
  }

  const access_token:string|null = localStorage.getItem("access_token");
  if(!access_token || access_token==="") return redirect("/");
  if(!params.range) return redirect("/top/month");
  
  const id:string = "top_tracks"+rangeNum;
  const sessionDataCheckString:string = "top_session_data_loaded"+rangeNum;
  const topSessionDataLoaded:string|null = sessionStorage.getItem(sessionDataCheckString);
  const idbTrackListData:ITrack[]|null = await getTrackList(Stores.TrackLists,id);

  if(idbTrackListData != null && topSessionDataLoaded != null) return {usingIdbData:true,list:idbTrackListData,id};
  
  const data = await requestTopTracks(access_token,rangeNum);
  if(data.items && Array.isArray(data.items)){
    sessionStorage.setItem(sessionDataCheckString, "true");
    return {usingIdbData:false, list:data.items,id};
  }
    
  return null;
}


export default function TopOf(){

  const [topTracksList,setTopTracksList] = useState<ITrack[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const loadedData= useLoaderData();
  const {handleListenOnClick} = useHandleListenOnClick();

  useEffect(()=>{
    const newTracks:ITrack[] = [];

    if(typeof loadedData === 'object' && loadedData !== null && 'list' in loadedData 
      && 'usingIdbData' in loadedData && Array.isArray(loadedData.list) 
      && typeof loadedData.usingIdbData === 'boolean' && 'id' in loadedData
      && typeof loadedData.id === "string"
     ){
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const trackCheckFunction = loadedData.usingIdbData === false ? isTrack : isITrackObject;
        const loaderItems = loadedData.list;
        let possibleTrack:ITrack|null = null;

        for(let i = 0; i < loaderItems.length; i++){

          possibleTrack = trackCheckFunction(loaderItems[i]);
          if(possibleTrack != null) newTracks.push(possibleTrack);
          /*
          if(loadedData.usingIdbData === false){
            possibleTrack = isTrack(loaderItems[i]);
          }
          else{
            possibleTrack = isITrackObject(loaderItems[i]);
          }
          if(possibleTrack !== null){
            newTracks.push(possibleTrack);
          }
            */
        }

      setTopTracksList(newTracks)
      if(loadedData.usingIdbData === false && loaderItems.length > 0) addTrackList(Stores.TrackLists,newTracks,loadedData.id);
      if(listRef.current !== null) listRef.current.scrollTo(0,0);
    }
  },[loadedData])

  return(
      <div className="overflow-y-scroll" ref={listRef}>
        <ul>
          {topTracksList.map((track)=>{
            return (
            <li key={track.id}>
            <TrackCard 
             track={{...track,trackSaveState:TrackSaveState.CantSave}}
             popModal={handleListenOnClick}
            />
            </li>)
          })}
        </ul>
        </div>
  )
}