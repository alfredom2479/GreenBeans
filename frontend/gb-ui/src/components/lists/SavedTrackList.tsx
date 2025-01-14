import {useState, useEffect, useRef} from "react"
import { redirect, useLoaderData, useParams, NavLink } from "react-router-dom";
import TrackCard from "../TrackCard";
import { requestSavedTracks } from "../../api";
import type {Params} from "react-router-dom";
import { ITrack, useHandleListenOnClick, TrackSaveState } from "../../interfaces";
import {  parseListLoaderData, getTrackListFromDidb } from "../../utils";
import { didb } from "../../dexiedb";
import refreshSvg from "../../assets/refresh-ccw-svgrepo-com.svg";
interface URLParams{params:Params}

export async function loader({params}:URLParams){

  const accessToken:string|null = localStorage.getItem("access_token");
  if(!accessToken || accessToken === "") return redirect('/'); 

  if(!params.page) return redirect("/saved/0");
  let pageNumber:number = 0;
  if(typeof params.page === "string"){
    pageNumber = Number(params.page);
    if(pageNumber < 0) pageNumber = 0;
  }

  const id:string = "saved_tracks"+pageNumber;
  let usingIdbData:boolean = false;

  const lastTrackSavedTime: string|null =sessionStorage.getItem("last_track_saved_time");
  //const idbTrackListData: ITrack[]|null = await getTrackList(Stores.TrackLists,id)

  let didbTrackListData:ITrack[]|null=null;

  try{
    didbTrackListData= await getTrackListFromDidb(id) ;
    //console.log(didbTrackListData);
  }
  catch(err){
    console.log("error getting track list from dexie ");
    console.log(err);
  }

  if(didbTrackListData != null){
    //const idbLastUpdatedTime:number|null = await getLastUpdatedTime(Stores.LastUpdated,id)
    let didbLastUpdatedTime:number|null = null;

    try{
      didbLastUpdatedTime = await didb.last_updated.get(id) || null;
      if(didbLastUpdatedTime === null){
        console.log("no last updated time found in dexie for: "+id);
      }
      else{
        console.log(didbLastUpdatedTime);
      }
    }
    catch(err){
      console.log("error getting last updated time from dexie: "+id);
      console.log(err);
    }

    if(Number(lastTrackSavedTime) < Number(didbLastUpdatedTime)){
      usingIdbData = true;
      return {usingIdbData,list:didbTrackListData,id};
    }
  }

  const data = await requestSavedTracks(pageNumber,50,accessToken);
  if(data && data.items && Array.isArray(data.items)){
    if(data.items.length === 0 && pageNumber !== 0) return redirect("/saved/0");
      //addLastUpdatedTime(Stores.LastUpdated,Date.now(),id);
      try{
        await didb.last_updated.put(Date.now(),id);
      }
      catch(err){
        console.log("error adding last updated time to dexie: "+id+" -> "+Date.now());
        console.log(err);
      }
    return {usingIdbData,list:data.items,id};
  }
    
  return null;
}


export default function SavedTrackList(){

  const [savedTracksList, setSavedTracksList] = useState<ITrack[]>([])
  const loaderData = useLoaderData();
  const listRef = useRef<HTMLDivElement | null>(null);
  const {handleListenOnClick} = useHandleListenOnClick();
  const {page} = useParams();
  const prevNextDefaultStyle = "flex-1 items-center justify-center bg-stone-900 hover:text-green-600 text-green-200 text-xl font-bold p-1  text-center border-stone-600 border-2  hover:border-green-300"

  const [displayPageNumber, setDisplayPageNumber] = useState(0);

  let pageNumber:number = 0, nextPageNumber:number = 0, prevPageNumber:number = 0;

  if(typeof page === "string" ){
    pageNumber = Number(page);
    if(pageNumber < 0) pageNumber = 0;
    if(pageNumber > 1) prevPageNumber = pageNumber -1;
    nextPageNumber = pageNumber +1;
  }

  useEffect(()=>{
    setDisplayPageNumber(pageNumber);
    parseListLoaderData(loaderData,setSavedTracksList,false);
    if(listRef !== null && listRef.current !== null) listRef.current.scrollTo(0,0);
  },[loaderData]);

  return(
  <div className="flex flex-col h-full ">
    <div className="flex">
        <div className="flex-1 text-center items-center justify-center text-green-200 text-3xl font-bold">{displayPageNumber+1}</div>
        <button 
          className="flex-[.5_.5_0%] flex justify-center items-center  p-1 border-stone-600 border-2 hover:border-green-300"
          onClick={() => {
            sessionStorage.setItem('last_track_saved_time', Date.now().toString());
            window.location.reload();
          }}
        >
          <img src={refreshSvg} alt="refresh" className="w-8"/>
        </button>
        <NavLink 
          to={`/saved/${prevPageNumber}`}
          onClick={()=>{
            if(pageNumber !== 0){
              setSavedTracksList([]);
              setDisplayPageNumber(prevPageNumber);
            } 
          }}
          className={({isPending,isTransitioning})=>[
            prevNextDefaultStyle,
            isPending ? "pointer-events-none" : "",
            isTransitioning ? "pointer-events-none" : "",
            pageNumber === 0 ? "pointer-events-none opacity-50" : ""
          ].join(" ")}
            >prev
        </NavLink>
        <NavLink 
          to={`/saved/${nextPageNumber}`}
          onClick={()=>{
            setSavedTracksList([]);
            setDisplayPageNumber(nextPageNumber);
          }}
          className={({isPending,isTransitioning})=>[
            prevNextDefaultStyle,
            isPending ? "pointer-events-none" : "",
            isTransitioning ? "pointer-events-none" : ""
          ].join(" ")}
            >next
        </NavLink>
    </div>
    <div className="overflow-y-scroll" 
      ref={listRef}>
        <ul>
          {savedTracksList.map((track)=>{
            return (
              <li key={track.id}>
                <TrackCard
                  hideSaveButton={true}
                  track={{...track,trackSaveState:TrackSaveState.Saved}}
                  popModal={handleListenOnClick}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}