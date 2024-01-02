//import {useState, useEffect} from 'react';
import { Outlet, redirect  } from "react-router-dom";
import { requestSavedTracks } from "../api";

//import { ITrack } from '../interfaces';


export async function loader(){
  
  const accessToken:string|null = localStorage.getItem("access_token");
  if(!accessToken || accessToken===""){
    return redirect("/");
  }

  try{
    const data = await requestSavedTracks(accessToken);
    console.log(data);

    if(data.items && Array.isArray(data.items)){
      return data.items;
    }
    else{
      return [];
    }
  }catch(err){
    console.log("There has been an error while loading in saved tracks data");
    console.log(err);
  }
}

export default  function SavedPage(){
  
  /*
  const [savedTracksList, setSavedTracksList] = useState<ITrack[]>([]);

  const loaderData = useLoaderData();

  useEffect(()=>{
    if(Array.isArray(loaderData)){

      const tempTrackList:ITrack[] = [];
      
      for(let i=0; i < loaderData.length;i++){
        const tempTrackInfo:ITrack = {id:"", name:"",artist:"",image:""};

        if(loaderData[i].id){
          tempTrackInfo.id = loaderData[i].id;
        }
        if(loaderData[i].name){
          tempTrackInfo.name = loaderData[i].name
        }
        if(loaderData[i].artists){
          if(Array.isArray(loaderData[i].artists) && loaderData[i].artists.length > 0){
            tempTrackInfo.artist = loaderData[i].artists[0].name;
          }
        }
        if(loaderData[i].album && loaderData[i].album.images){
          if(Array.isArray(loaderData[i].album.images) && 
            loaderData[i].album.images.length > 0){
              tempTrackInfo.image = loaderData[i].album.images[loaderData[i].album.images.length-1].url;
            }
        }
        if(loaderData[i].preview_url){
          tempTrackInfo.url = loaderData[i].preview_url;
        }
        else if(loaderData[i].external_urls && loaderData[i].external_urls.spotify){
          tempTrackInfo.url = loaderData[i].external_urls.spotify;
        }
        tempTrackList.push(tempTrackInfo);
      }
      setSavedTracksList(tempTrackList);
    }
  },[loaderData]);
  */
  
  return(
    <div className="max-h-screen flex flex-col">
      <div className="basis-1/4 flex flex-col">
        <h1 className="basis-1/2 text-purple-200 font-bold text-4xl text-center py-5">
          Your Saved Tracks
        </h1>
      </div>
      <Outlet/>
    </div>
  )
}