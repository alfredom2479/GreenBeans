import {useEffect, useRef, useState} from "react";
import { redirect,useLoaderData} from "react-router-dom";
import type {Params} from 'react-router-dom';
import TrackCard from "../TrackCard";
import TopNavItem from "../navigation/TopNavItem";
import { ITrack, TrackSaveState } from "../../interfaces";
import { requestTopTracks } from '../../api';
import {  parseListLoaderData, getTrackListFromDidb } from "../../utils";
import { useHandleListenOnClick } from "../../interfaces";

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

  //const idbTrackListData:ITrack[]|null = await getTrackList(Stores.TrackLists,id);
  
  let didbTrackListData:ITrack[]|null=null;

  try{
    didbTrackListData= await getTrackListFromDidb(id) ;
    //console.log(didbTrackListData);
  }
  catch(err){
    console.log("error getting track list from dexie ");
    console.log(err);
  }

  if(didbTrackListData != null && topSessionDataLoaded != null) return {usingIdbData:true,list:didbTrackListData,id};
  
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
    parseListLoaderData(loadedData,setTopTracksList,true);
    if(listRef !== null && listRef.current !== null) listRef.current.scrollTo(0,0);
  },[loadedData])

  return(
    <>
      <div className="basis-1/12 flex flex-col">
        <nav className="flex flex-col justify-center font-bold  h-12">
          <ul className={`flex text-stone-200`}>
          <TopNavItem path="/top/month" name="30d" onClick={()=>{
            setTopTracksList([]);
          }}/>
          <TopNavItem path="/top/sixmonths" name="6m" onClick={()=>{
            setTopTracksList([]);
          }}/>
          <TopNavItem path="/top/alltime" name="y+" onClick={()=>{
            setTopTracksList([]);
          }}/>
        </ul>
      </nav>
      </div>

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
    </>
  )
}