import {useState, useEffect} from "react"
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

  let pageNumber:number = 0;

  if(typeof params.page === "string"){
    
    pageNumber = Number(params.page);

    if(pageNumber < 0){
      pageNumber = 0
    }
  }
    const data = await requestSavedTracks(pageNumber,50,accessToken);
    
    if(data && data.items && Array.isArray(data.items)){
      if(data.items.length === 0){
        if(pageNumber !== 0 ){
          return redirect("/saved/0")
        }
      }
      return data.items;
    }
    else{
      return [];
    }
}

export default function SavedTrackList(){

  const [savedTracksList, setSavedTracksList] = useState<ITrack[]>([])

  const {handleListenOnClick} = useHandleListenOnClick();

  const loaderData = useLoaderData();

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
    }
  },[loaderData]);

  return(
  <div className="flex flex-col h-full pb-16">
  
    <div className=" overflow-y-scroll">
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
    <div className="flex">
        {pageNumber !== 0 ?
          <NavLink 
          to={`/saved/${prevPageNumber}`}
          className="flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold p-1  text-center border-white border-2 border-l-0 hover:border-purple-600"
          >prev
        </NavLink>
        : 
          null
        }
        <NavLink 
          to={`/saved/${nextPageNumber}`}
          className="flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold p-1  text-center border-white border-2 border-r-0 border-l-2 hover:border-purple-600"
          >next
        </NavLink>
    </div>
    </div>
  )

}