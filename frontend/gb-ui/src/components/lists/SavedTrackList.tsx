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
  const prevNextBaseStyle = "flex-1 flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-600/50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
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

  return (
    <div className="min-h-[calc(100%-3.5rem)] w-full flex flex-col">
      <section className="shrink-0 px-4 sm:px-6 pt-6 sm:pt-10 pb-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-center text-3xl sm:text-4xl font-bold text-white tracking-tight">
            My Saved Tracks
          </h1>
          <p className="text-center text-zinc-400 text-sm sm:text-base mt-1">
            Page {displayPageNumber + 1}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("last_track_saved_time", Date.now().toString());
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50"
              aria-label="Refresh list"
            >
              <img src={refreshSvg} alt="" className="w-5 h-5" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            <NavLink
              to={`/saved/${prevPageNumber}`}
              onClick={() => {
                if (pageNumber !== 0) {
                  setSavedTracksList([]);
                  setDisplayPageNumber(prevPageNumber);
                }
              }}
              className={({ isPending, isTransitioning }) => [
                prevNextBaseStyle,
                isPending ? "pointer-events-none" : "",
                isTransitioning ? "pointer-events-none" : "",
                pageNumber === 0 ? "opacity-50 pointer-events-none" : "",
              ].join(" ")}
            >
              Previous
            </NavLink>
            <NavLink
              to={`/saved/${nextPageNumber}`}
              onClick={() => {
                setSavedTracksList([]);
                setDisplayPageNumber(nextPageNumber);
              }}
              className={({ isPending, isTransitioning }) => [
                prevNextBaseStyle,
                isPending ? "pointer-events-none" : "",
                isTransitioning ? "pointer-events-none" : "",
              ].join(" ")}
            >
              Next
            </NavLink>
          </div>
        </div>
      </section>

      <section className="flex-1 min-h-0 px-4 sm:px-6 pb-6" aria-label="Saved tracks list">
        <div className="mx-auto max-w-2xl h-full rounded-xl overflow-hidden bg-zinc-900/30 border border-zinc-800/50">
          <div className="overflow-y-auto max-h-[60vh] sm:max-h-[65vh] h-full" ref={listRef}>
            {savedTracksList.length === 0 ? (
              <div className="h-48 sm:h-56 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-zinc-500 text-sm sm:text-base">Loading saved tracks…</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800/80">
                {savedTracksList.map((track, index) => (
                  <li key={track.id}>
                    <TrackCard
                      hideSaveButton={true}
                      track={{ ...track, trackSaveState: TrackSaveState.Saved }}
                      popModal={(info) =>
                        handleListenOnClick(info, index, savedTracksList, (track) =>
                          setSavedTracksList((prev) =>
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