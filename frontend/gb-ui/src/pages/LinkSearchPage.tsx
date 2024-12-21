import {useEffect, useRef, useState} from "react";
import {Form, redirect, useActionData} from 'react-router-dom';
import { requestSpotifyTrack } from '../api';

//import spotifyLogo from "../assets/spotify_logo.png";

interface ActionParams{
  //params: Params,
  request: Request  
}
export async function action({request}:ActionParams){

  let isLoggedIn = true;

  let access_token:string|null = localStorage.getItem("access_token");
  if(!access_token || access_token === ""){
    isLoggedIn = false;
    access_token = "";
  }

  const formData = await request.formData();
  const spotifyLink = formData.get("spotify-link");

  //PARSE input

  if(spotifyLink === null || typeof spotifyLink !== "string"){
    return null;
  }

  let trackId:string|null = null;

  let indexSearchString = "spotify.com/track/";
  let spotifyUrlIndex = spotifyLink.indexOf(indexSearchString);

  if(spotifyUrlIndex <0){
    //retry to fiind trackId. this pattern is found in 'spotify wrapped' links
    indexSearchString = "track-id=";
    spotifyUrlIndex = spotifyLink.indexOf(indexSearchString);
    if(spotifyUrlIndex <0){
      return "track not found"+spotifyLink;
    }
  }

  trackId = spotifyLink.substring(spotifyUrlIndex+indexSearchString.length,spotifyUrlIndex+indexSearchString.length+22);

  //need try catch bc if not, Response will be uncaught
  try{
    const data = await requestSpotifyTrack(access_token,trackId,isLoggedIn);
    if(!data || data === undefined){
      return "track not found"+spotifyLink
    }
    return redirect(`/track/${trackId}`);
  }catch(err){
    return "track not found"+spotifyLink;
  }
}

export default function LinkSearchPage(){

  const [searchResultsLoading,setSearchResultsLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const actionData = useActionData();

  useEffect(()=>{
    if(actionData && typeof actionData === "string" && actionData.includes("track not found") && searchInputRef.current !== null){
      searchInputRef.current.value = "TRACK NOT FOUND"
    }
    setSearchResultsLoading(false);
  },[actionData,searchResultsLoading])

  return (
    <div className="h-full w-full flex flex-col ">
      <div className="flex  flex-col items-center w-full h-full">
          <div className="text-center lg:text-7xl text-5xl text-green-600 p-10">GreenBeans</div>
        <Form method='post'
        onSubmit={()=>{setSearchResultsLoading(true)}}
          className='flex flex-col justify-center items-center w-full'>
          <label htmlFor="spotify-link" className="text-xl text-green-50 mb-2">Paste a track's Spotify share link:</label>
          <input ref={searchInputRef} type="text" name="spotify-link" placeholder="https://open.spotify.com/track/06cqIVC8kRAT02qfHQT65v"
          className="text-xl h-10 w-10/12 px-1 rounded-xl"/>
          <button 
          disabled={searchResultsLoading}
          type='submit' 
          className={`w-40 h-12 mt-4 font-bold text-xl rounded-lg hover:shadow-2xl 
                     ${searchResultsLoading 
                        ? "bg-green-100 cursor-not-allowed" 
                        : "bg-green-200 hover:bg-green-500"}`}>
            GO
          </button>
        </Form>
      </div>
        {/*mayba implement search history functionality using redux*/}
    </div>
  )
}
