import {useEffect, useState} from "react";
import { redirect,useLoaderData} from "react-router-dom";
import type {Params} from 'react-router-dom';

import { requestTopTracks } from '../api';

interface TopParams{
  params:Params
}

export async function loader({params}:TopParams){
  console.log(params);

  switch(params.range){
    case "month":
      console.log("This is top of month");
      break;
    case "sixmonths":
      console.log("This is top of past 6 months");
      break;
    case "alltime":
      console.log("This is top of all time");
      break;
    default:
      console.log("This is top of NO time bc this is an error");
  }

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestTopTracks(access_token,3);
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

interface ITrack{
  name?:string
}

export default function TopOf(){

  const [topTracksList,setTopTracksList] = useState<ITrack[]>([]);

  const loadedData= useLoaderData();

  useEffect(()=>{
    let loaderItems = [];

    const newTracks:ITrack[] = [];

    if(Array.isArray(loadedData)){
      loaderItems = loadedData;

      for(let i = 0; i < loaderItems.length; i++){
        newTracks.push({name: loaderItems[i].name ? loaderItems[i].name : "No Name"});
      }
    }

    setTopTracksList(newTracks)
  },[loadedData])

  console.log(topTracksList);

  return(
    <>
      <h1>These are your top songs of </h1>
      <ul>
        {topTracksList.map((track)=>{
          return <li key={track.name} >{track.name}</li>
        })}
      </ul>
    </>
  )
}