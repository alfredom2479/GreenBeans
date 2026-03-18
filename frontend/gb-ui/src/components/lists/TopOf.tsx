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

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col">
      <section className="shrink-0 px-4 sm:px-6 pt-6 sm:pt-10 pb-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-center text-3xl sm:text-4xl font-bold text-white tracking-tight">
            My Top Tracks
          </h1>
          <p className="text-center text-zinc-400 text-sm sm:text-base mt-1">
            Your most played tracks
          </p>
          <nav className="mt-4 flex rounded-lg overflow-hidden bg-zinc-800/50 border border-zinc-700/50 p-1" aria-label="Time range">
            <ul className="flex flex-1 text-zinc-300">
              <TopNavItem path="/top/month" name="30d" onClick={() => setTopTracksList([])} />
              <TopNavItem path="/top/sixmonths" name="6m" onClick={() => setTopTracksList([])} />
              <TopNavItem path="/top/alltime" name="y+" onClick={() => setTopTracksList([])} />
            </ul>
          </nav>
        </div>
      </section>

      <section className="flex-1 min-h-0 px-4 sm:px-6 pb-6" aria-label="Top tracks list">
        <div className="mx-auto max-w-2xl h-full rounded-xl overflow-hidden bg-zinc-900/30 border border-zinc-800/50">
          <div className="overflow-y-auto min-h-0 h-full" ref={listRef}>
            {topTracksList.length === 0 ? (
              <div className="h-48 sm:h-56 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-zinc-500 text-sm sm:text-base">Loading top tracks…</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800/80">
                {topTracksList.map((track, index) => (
                  <li key={track.id}>
                    <TrackCard
                      hideSaveButton={true}
                      track={{ ...track, trackSaveState: TrackSaveState.CantSave }}
                      popModal={(info) =>
                        handleListenOnClick(info, index, topTracksList, (track) =>
                          setTopTracksList((prev) =>
                            prev.map((t) => (t.id === track.id ? { ...t, trackSaveState: TrackSaveState.Saved } : t))
                          )
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}