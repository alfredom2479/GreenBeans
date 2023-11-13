import {useState, useEffect} from "react";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import { requestSpotifyTrack } from "../api";
import type {Params} from "react-router-dom";

interface IURLParams{
  params:Params
}

export async function loader({params}:IURLParams){
  console.log(params);

  let trackId:string = "bad_track_id";

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
  }

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestSpotifyTrack(access_token, trackId);
    console.log(data);

    //dont check anything about the data.
    //should be fine. Pretty simple return object
    //yolo
    return data;

  }catch(err){
    console.log("there has been a get-trackId");
    console.log(err);
    throw err;
  }

}

export default function TrackPage(){

  const [trackData, setTrackData] = useState({name: "", artist: "", image:""});
  const loaderData = useLoaderData();

  useEffect(()=>{
    let tempName:string="";
    let tempArtist:string="";
    let tempImageUrl:string="";

    if(typeof loaderData === 'object' && loaderData ){
      if('name' in loaderData && typeof loaderData.name === "string"){
        tempName = loaderData.name;
      }
      if('artists' in loaderData && Array.isArray(loaderData.artists) ){
        if(loaderData.artists.length >0 && loaderData.artists[0].name){
          tempArtist = loaderData.artists[0].name
        }
      }
      if('album' in loaderData && typeof loaderData.album === 'object' && loaderData.album){
        
        if('images' in loaderData.album && Array.isArray(loaderData.album.images)){
          if(loaderData.album.images.length > 0 && loaderData.album.images[loaderData.album.images.length-1].url){
            tempImageUrl = loaderData.album.images[loaderData.album.images.length-1].url;
          }
        }
      }
      setTrackData({name: tempName, artist: tempArtist, image: tempImageUrl});
    }
    
  },[loaderData])

  return(
    <>
      <div className="bg-purple-400 flex">
        <div className="flex-5">
          <img src={trackData.image}
          className="h-40">
          </img>
        </div>
        <div className="flex-1">
          <div className="text-2xl">
            {trackData.name}
          </div>
          <div>
            <i>{trackData.artist}</i>
          </div>
        </div>
      </div> 
      <Outlet/>
    </>
  )
}


//test image:
//https://i.scdn.co/image/ab67616d000048517974d577a51ae3a912685b24