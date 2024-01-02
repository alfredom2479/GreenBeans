import {useState, useEffect} from "react"
import { redirect, useLoaderData } from "react-router-dom";
import TrackCard from "./TrackCard";
import { requestSavedTracks } from "../api";

import { ITrack } from "../interfaces";

export async function loader(){
  const accessToken:string|null = localStorage.getItem("access_token");
  if(!accessToken || accessToken === ""){
    return redirect('/');
  }

  try{
    const data = await requestSavedTracks(accessToken);
    
    if(data.items && Array.isArray(data.items)){
      return data.items;
    }
    else{
      return [];
    }
  }catch(err){
    console.log("Thre has been an error while loading the saved tracks data");
    console.log(err);
  }
}

export default function SavedTrackList(){

  const [savedTracksList, setSavedTracksList] = useState<ITrack[]>([])

  const loaderData = useLoaderData();

  useEffect(()=>{
    if(Array.isArray(loaderData)){

      const tempTrackList:ITrack[] = [];
      
      for(let i=0; i < loaderData.length;i++){
        console.log(loaderData[i]);
        const tempTrackInfo:ITrack = {id:"", name:"",artist:"",image:""};

        if(!loaderData[i].track){
          continue;
        }
        if(loaderData[i].track.id){
          tempTrackInfo.id = loaderData[i].track.id;
        }
        if(loaderData[i].track.name){
          tempTrackInfo.name = loaderData[i].track.name
        }
        if(loaderData[i].track.artists){
          if(Array.isArray(loaderData[i].track.artists) && loaderData[i].track.artists.length > 0){
            tempTrackInfo.artist = loaderData[i].track.artists[0].name;
          }
        }
        if(loaderData[i].track.album && loaderData[i].track.album.images){
          if(Array.isArray(loaderData[i].track.album.images) && 
            loaderData[i].track.album.images.length > 0){
              tempTrackInfo.image = loaderData[i].track.album.images[loaderData[i].track.album.images.length-1].url;
            }
        }
        if(loaderData[i].track.preview_url){
          tempTrackInfo.url = loaderData[i].track.preview_url;
        }
        else if(loaderData[i].track.external_urls && loaderData[i].track.external_urls.spotify){
          tempTrackInfo.url = loaderData[i].track.external_urls.spotify;
        }
        tempTrackList.push(tempTrackInfo);
      }
      console.log(tempTrackList);
      setSavedTracksList(tempTrackList);
    }
  },[loaderData]);


  return(
    <div className="basis-3/4 overflow-y-scroll">
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
                />
            </li>
          )
        })}
      </ul>

    </div>
  )

}