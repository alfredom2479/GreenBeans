import {useEffect, useState} from "react";
import { redirect,useLoaderData} from "react-router-dom";
import type {Params} from 'react-router-dom';

import TrackCard from "../components/TrackCard";
import { ITrack } from "../interfaces";

import { requestTopTracks } from '../api';

interface TopParams{
  params:Params
}

export async function loader({params}:TopParams){
  console.log(params);
  let rangeNum:number = 0;

  switch(params.range){
    case "month":
      console.log("This is top of month");
      rangeNum = 0;
      break;
    case "sixmonths":
      console.log("This is top of past 6 months");
      rangeNum = 1;
      break;
    case "alltime":
      console.log("This is top of all time");
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
          if(loaderItems[i].artists && Array.isArray(loaderItems[i].artists)
            && loaderItems[i].artists.length > 0 && loaderItems[i].artists[0].name ){
            mainArtist = loaderItems[i].artists[0].name;
          }
          let smallImageURL:string = "default_image_url";
          if(loaderItems[i].album && loaderItems[i].album.images &&
             Array.isArray(loaderItems[i].album.images)
          && loaderItems[i].album.images.length > 0 &&
          loaderItems[i].album.images[loaderItems[i].album.images.length-1].url){
              smallImageURL = loaderItems[i].album.images[loaderItems[i].album.images.length-1].url;
            }
          newTracks.push({
            name: loaderItems[i].name ? loaderItems[i].name : "No Name",
            //no item should have the id of "no_id" bc of the 
            //wrapping if statement
            id: loaderItems[i].name ? loaderItems[i].id : "no_id",
            artist: mainArtist,
            image: smallImageURL
          });
        }
      }
    }

    setTopTracksList(newTracks)
  },[loadedData])

  console.log(topTracksList);

  return(
    <>
      {/*  
      <h1>These are your top songs of </h1>
      <ul>
        {topTracksList.map((track)=>{
          return <li key={track.name} >{track.name}</li>
        })}
      </ul>
        */}
      <div>
        {/* <TrackCard/> */}
        <ul>
          {topTracksList.map((track)=>{
            return (
            <li key={track.id}>
            <TrackCard 
              id={track.id} 
              name={track.name}
              artist={track.artist}
              image={track.image}
            />
            </li>)
          })}
        </ul>
      </div>

    </>
  )
}