import {useState, useEffect} from "react";
import { redirect, useLoaderData } from "react-router-dom";
import type { Params } from "react-router-dom";
import { requestSpotifyRec } from "../api";
import { ITrack } from "../interfaces";
import TrackCard from "./TrackCard";

interface ILoaderParams{
  params: Params,
  request: Request
}

export async function loader({params,request}:ILoaderParams){
  console.log("in rec Section loader");
  console.log(params);
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  console.log("has apple: "+queryParams.has("apple"));
  console.log("has esketit: "+queryParams.has("esketit"));

  let trackId:string = "bad_track_id";

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
    console.log(trackId);
  }
  else{
    return redirect("/");
  }
  //dont even try to request if u do not have
  //access token or a trackId
  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token ||access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestSpotifyRec(access_token,trackId,[],{});
    console.log(data);

   if(data.tracks && Array.isArray(data.tracks)){
    return data.tracks;
   } 

   return [];
  }catch(err){
    console.log("there has been a rec action error");
    console.log(err);
    throw err;
  }
}

export default function RecsSection(){

  const [recList,setRecList] = useState<ITrack[]>([]);
  const loaderData = useLoaderData();

  useEffect(()=>{
    if(Array.isArray(loaderData)){
      const tempTrackList:ITrack[] =[];
      for(let i=0; i< loaderData.length;i++){
        const tempTrackInfo:ITrack = {id:"",name:"",artist:"",image:""}
        if(loaderData[i].id ){
          tempTrackInfo.id = loaderData[i].id;
        }
        if(loaderData[i].name){
          tempTrackInfo.name = loaderData[i].name;
        }
        if(loaderData[i].artists){
          if(Array.isArray(loaderData[i].artists) && loaderData[i].artists.length > 0){
            tempTrackInfo.artist = loaderData[i].artists[0].name;
          }
        }
        if(loaderData[i].album && loaderData[i].album.images){
          if(Array.isArray(loaderData[i].album.images) 
            && loaderData[i].album.images.length >0){
              tempTrackInfo.image = loaderData[i].album.images[loaderData[i].album.images.length-1].url;
            }
        }
        tempTrackList.push(tempTrackInfo);
      }
      setRecList(tempTrackList);
    }
  },[loaderData])

  
  console.log(recList)
  return(
    <>
    <div>
    <ul>
      {recList.map((track)=>{
        return (
          <li key={track.id}>
            <TrackCard
              id={track.id}
              name={track.name}
              artist={track.artist}
              image={track.image}
            />
          </li>
        )
      })}
    </ul>
    </div>
    </>
  )
}