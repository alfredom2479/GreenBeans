import {useState, useEffect, useRef} from "react"
import { redirect, useLoaderData, useParams, NavLink } from "react-router-dom";
import TrackCard from "./TrackCard";
import { requestSavedTracks } from "../api";

import type {Params} from "react-router-dom";

import { ITrack, useHandleListenOnClick, TrackSaveState } from "../interfaces";
import { isTrack } from "../utils";

interface URLParams{
  params:Params
}

export async function loader({params}:URLParams){

  const accessToken:string|null = localStorage.getItem("access_token");
  if(!accessToken || accessToken === ""){
    return redirect('/');
  }
  if(!params.page){
    return redirect("/saved/0");
  }

  let pageNumber:number = 0;

  if(typeof params.page === "string"){
    
    pageNumber = Number(params.page);

    if(pageNumber < 0){
      pageNumber = 0
    }
  }

  const sessionSavedTracksData: string|null = sessionStorage.getItem("saved_tracks"+pageNumber);

  if(sessionSavedTracksData !== null){
    try{
      const savedTracksDataJsond = JSON.parse(sessionSavedTracksData);
      if('items' in savedTracksDataJsond){
        return savedTracksDataJsond.items;
    }
    }catch(err){
      console.log(err)
    }
  }

    const data = await requestSavedTracks(pageNumber,50,accessToken);
    
    if(data && data.items && Array.isArray(data.items)){
      if(data.items.length === 0){
        if(pageNumber !== 0 ){
          return redirect("/saved/0");
        }
      }
      sessionStorage.setItem("saved_tracks"+pageNumber,JSON.stringify(data));
      return data.items;
    }
    else{
      return null;
    }
}

export default function SavedTrackList(){

  const [savedTracksList, setSavedTracksList] = useState<ITrack[]>([])

  const {handleListenOnClick} = useHandleListenOnClick();

  const loaderData = useLoaderData();

  const listRef = useRef<HTMLDivElement | null>(null);

  const prevNextDefaultStyle = "flex-1 items-center justify-center bg-stone-900 hover:text-green-600 text-green-200 text-xl font-bold p-1  text-center border-white border-2 border-l-0 hover:border-green-300"

  const {page} = useParams();
  let pageNumber:number = 0;
  let nextPageNumber:number = 0;
  let prevPageNumber:number =0;

  if(typeof page === "string" ){
    pageNumber =Number(page)
    
    if(pageNumber < 0){
      pageNumber = 0;
    }

    if(pageNumber !== 0){
      prevPageNumber = pageNumber -1;
    }
      nextPageNumber = pageNumber +1;

  }

  useEffect(()=>{
    if(Array.isArray(loaderData)){

      const tempTrackList:ITrack[] = [];
      let possibleTrack:ITrack|null = null
      
      for(let i=0; i < loaderData.length;i++){
        possibleTrack = isTrack(loaderData[i].track)
        if(possibleTrack != null){
          tempTrackList.push(possibleTrack)
        }
      }
      setSavedTracksList(tempTrackList);
      if(listRef.current !== null){
        listRef.current.scrollTo(0,0);
      }
    }
  },[loaderData]);

  return(
  <div className="flex flex-col h-full ">
  <div className="flex ">
        {pageNumber !== 0 ?
          <NavLink 
          to={`/saved/${prevPageNumber}`}
          className={({isPending,isTransitioning})=>[
            prevNextDefaultStyle,
            isPending ? "pointer-events-none" : "",
            isTransitioning ? "pointer-events-none" : ""
          ].join(" ")
        }
          >prev
        </NavLink>
        : 
          null
        }
        <NavLink 
          to={`/saved/${nextPageNumber}`}
          className={({isPending,isTransitioning})=>[
            prevNextDefaultStyle,
            isPending ? "pointer-events-none" : "",
            isTransitioning ? "pointer-events-none" : ""
          ].join(" ")
        }
          >next
        </NavLink>
    </div>
    <div className=" overflow-y-scroll" ref={listRef}>
      <ul>
        {savedTracksList.map((track)=>{
          return (
            <li key={track.id}>
              <TrackCard
                id={track.id}
                name={track.name}
                artist={track.artist}
                image={track.image}
                url={track.url}
                popModal={handleListenOnClick}
                trackSaveState={TrackSaveState.Saved}
                />
            </li>
            
          )
        })}
      </ul>
    </div>
    
    </div>
  )

}