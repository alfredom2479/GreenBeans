import {useEffect, useState} from "react";
import { redirect,useLoaderData} from "react-router-dom";
import type {Params} from 'react-router-dom';

import TrackCard from "./TrackCard";
import { ITrack } from "../interfaces";

import { requestTopTracks } from '../api';

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
    case "alltime":
      rangeNum=2;
      break;
    default:
      rangeNum=2
      console.log("This is top of NO time bc this is an error");
  }

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestTopTracks(access_token,rangeNum);
    console.log(data);

    if(data.items && Array.isArray(data.items)){
      return data.items
    }
    
    return [];
  }catch(err){
    console.log("there has been an error");
    console.log(err);
    throw err;
  }
    
}

/*interface ITrack{
  name?:string
}
*/
export default function TopOf(){

  const [topTracksList,setTopTracksList] = useState<ITrack[]>([]);

  const loadedData= useLoaderData();

  useEffect(()=>{
    let loaderItems = [];

    const newTracks:ITrack[] = [];

    if(Array.isArray(loadedData)){
      loaderItems = loadedData;
      
      //There has to be a prettier way to write the code below
      //lol i forgot i typed this ^, he's right

      for(let i = 0; i < loaderItems.length; i++){
        if(loaderItems[i].id){
          let mainArtist:string = "???";
          let smallImageURL:string = "default_image_url";
          let listenUrl:string = "";
          if(loaderItems[i].artists && Array.isArray(loaderItems[i].artists)
            && loaderItems[i].artists.length > 0 && loaderItems[i].artists[0].name ){
            mainArtist = loaderItems[i].artists[0].name;
          }
          if(loaderItems[i].album && loaderItems[i].album.images &&
             Array.isArray(loaderItems[i].album.images)
          && loaderItems[i].album.images.length > 0 &&
          loaderItems[i].album.images[loaderItems[i].album.images.length-1].url){
              smallImageURL = loaderItems[i].album.images[loaderItems[i].album.images.length-2].url;
            }
          if(loaderItems[i].preview_url){
            listenUrl = loaderItems[i].preview_url;
          }
          else if(loaderItems[i].external_urls && loaderItems[i].external_urls.spotify){
            listenUrl = loaderItems[i].external_urls.spotify;
          }
          newTracks.push({
            name: loaderItems[i].name ? loaderItems[i].name : "No Name",
            //no item should have the id of "no_id" bc of the 
            //wrapping if statement
            id: loaderItems[i].name ? loaderItems[i].id : "no_id",
            artist: mainArtist,
            image: smallImageURL,
            url: listenUrl

          });
        }
      }
    }

    setTopTracksList(newTracks)
  },[loadedData])

  console.log(topTracksList);

  return(
      <div className="overflow-y-scroll">
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
            />
            </li>)
          })}
        </ul>
      </div>

  )
}