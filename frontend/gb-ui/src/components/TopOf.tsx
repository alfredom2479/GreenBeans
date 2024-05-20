import {useEffect, useRef, useState} from "react";
import { redirect,useLoaderData} from "react-router-dom";
import type {Params} from 'react-router-dom';

import TrackCard from "./TrackCard";
import { ITrack, TrackSaveState } from "../interfaces";

import { requestTopTracks } from '../api';
import { isITrackObject, isTrack } from "../utils";
import { useHandleListenOnClick } from "../interfaces";
import { Stores, addTrackList, getTrackList } from "../idb";

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

  const id:string = "top_tracks"+rangeNum;
  let usingIdbData:boolean = false;
  //const sessionData: string|null = sessionStorage.getItem("top_tracks"+rangeNum);
  const idbTrackListData: ITrack[]|null = await getTrackList(Stores.TrackLists,"top_tracks"+rangeNum);

  if(idbTrackListData != null){
    usingIdbData = true;
    console.log("idbTrackListData is not null");
    console.log(idbTrackListData);
    return {usingIdbData,list:idbTrackListData,id}
  }

  /*
  if(sessionData !== null ){
    try{
      const topTracksJsond = JSON.parse(sessionData);
      if('items' in topTracksJsond){
        return topTracksJsond.items;
      }
    }catch(err){
      console.log(err);
    }
  }
  */

  const data = await requestTopTracks(access_token,rangeNum);
  if(data.items && Array.isArray(data.items)){
    //sessionStorage.setItem("top_tracks"+rangeNum,JSON.stringify(data))
    return {usingIdbData, list:data.items,id};
  }
    
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

    console.log(loadedData);
    if(typeof loadedData === 'object' && loadedData !== null && 'list' in loadedData 
      && 'usingIdbData' in loadedData && Array.isArray(loadedData.list) 
      && typeof loadedData.usingIdbData === 'boolean' && 'id' in loadedData
      && typeof loadedData.id === "string"
     ){
      console.log("useEffect type check passed");
      loaderItems = loadedData.list;
     

    //if(Array.isArray(loadedData)){
      //loaderItems = loadedData;
        let possibleTrack:ITrack|null = null;

        for(let i = 0; i < loaderItems.length; i++){
          if(loadedData.usingIdbData === false){
            possibleTrack = isTrack(loaderItems[i]);
          }
          else{
            possibleTrack = isITrackObject(loaderItems[i]);
          }
          if(possibleTrack !== null){
            newTracks.push(possibleTrack);
          }
        }
      //}

      setTopTracksList(newTracks)
      if(loadedData.usingIdbData === false){
        addTrackList(Stores.TrackLists,newTracks,loadedData.id)
      }
      
      if(listRef.current !== null){
        listRef.current.scrollTo(0,0);
      }
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