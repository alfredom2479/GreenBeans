import {useEffect, useRef, useState} from "react";
import { redirect,useLoaderData} from "react-router-dom";
import type {Params} from 'react-router-dom';

import TrackCard from "./TrackCard";
import { ITrack, TrackSaveState } from "../interfaces";

import { requestTopTracks } from '../api';
import { isTrack } from "../utils";
import { useHandleListenOnClick } from "../interfaces";

interface TopParams{
  params:Params
}

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

  if(!access_token || access_token===""){
    return redirect("/");
  }
if(!params.range){
    return redirect("/top/month");
  }

    const data = await requestTopTracks(access_token,rangeNum);
    if(data.items && Array.isArray(data.items)){
      return data.items
    }
    
    //need to return error to be handled by error element
    return null;
    
}

export default function TopOf(){

 const {handleListenOnClick} = useHandleListenOnClick();

  const [topTracksList,setTopTracksList] = useState<ITrack[]>([]);

  const loadedData= useLoaderData();

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    let loaderItems = [];
    const newTracks:ITrack[] = [];

    if(Array.isArray(loadedData)){
      loaderItems = loadedData;
      let possibleTrack:ITrack|null = null;

      for(let i = 0; i < loaderItems.length; i++){
        possibleTrack = isTrack(loaderItems[i]);
         if(possibleTrack !== null){
          newTracks.push(possibleTrack);
         }
      }
    }
    setTopTracksList(newTracks)
    if(listRef.current !== null){
      listRef.current.scrollTo(0,0);
    }
  },[loadedData])

  return(
      <div className="overflow-y-scroll" ref={listRef}>
        <ul>
          {topTracksList.map((track)=>{
            return (
            <li key={track.id}>
            <TrackCard 
              id={track.id} 
              name={track.name}
              artist={track.artist}
              image={track.image}
              url={track.url}
              popModal={handleListenOnClick}
              trackSaveState={TrackSaveState.CantSave}
            />
            </li>)
          })}
        </ul>
        </div>
  )
}