import {useEffect, useRef} from "react";
import {Form, redirect, useActionData} from 'react-router-dom';
import { requestSpotifyTrack } from '../api';

import spotifyLogo from "../assets/spotify_logo.png";

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

  const spotifyUrlIndex = spotifyLink.indexOf("spotify.com/track/");

  if(spotifyUrlIndex <0){
    return null;
  }

  trackId = spotifyLink.substring(spotifyUrlIndex+18,spotifyUrlIndex+40);

  //need try catch bc if not, Response will be uncaught
  try{
    const data = await requestSpotifyTrack(access_token,trackId,isLoggedIn);
    if(!data || data === undefined){
      console.log("Track not found")
      return "track not found"
    }
    return redirect(`/track/${trackId}`);
  }catch(err){
    return "track not found";
  }
}

export default function LinkSearchPage(){

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const actionData = useActionData();

  useEffect(()=>{
    if(actionData === "track not found" && searchInputRef.current !== null){
      searchInputRef.current.value = "TRACK NOT FOUND"
    }
  },[actionData])

  return (
    <div className="h-full w-full pb-16 flex flex-col ">


      {/* <div className="h-14 shrink-0 p-2 flex items-center justify-between text-right mx-2">
        <a href='https://spotify.com' target='_blank' >
          <img src={spotifyLogo} className='flex-1 h-10 grow-0' />
        </a>
        <h1 className="flex-1 basis-1/2 text-white font-bold text-4xl ">
          Link-Search
        </h1>
      </div> */}

      <div className="flex flex-col items-center justify-center w-full h-full">
        <Form method='post'
          className='flex flex-col justify-center items-center w-full'>
          <label htmlFor="spotify-link"></label>
          <input ref={searchInputRef} type="text" name="spotify-link" placeholder="https://open.spotify.com/track/06cqIVC8kRAT02qfHQT65v"
          className="text-xl h-10 w-10/12 px-1 rounded-xl"/>
          <button type='submit' className="w-40 h-12 mt-4 bg-green-200 font-bold text-xl rounded-lg hover:shadow-2xl hover:bg-green-500">
            search
          </button>
        </Form>
      </div>

        {/*mayba implement search history functionality using redux
      <div className="flex flex-col justify-center items-center">
        <h3 className="text-purple-300 font-bold text-2xl pt-4">Search History</h3>
        <br/>
        <h4 className="text-purple-300 font-bold text-xl pt-2">(Under Construction)</h4>
      </div>

        */}
    </div>
  )
}
