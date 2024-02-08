import {useEffect, useRef} from "react";
import {Form, redirect, useActionData} from 'react-router-dom';
import { requestSpotifyTrack } from '../api';

//import type {Params} from "react-router-dom";

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
    console.log(data);
    if(!data || data === undefined){
      console.log("Track not found")
    //Throw track not found error that will be caught by the errorElement
      return "track not found"
    }
    return redirect(`/track/${trackId}`);
  }catch(err){
    //Throw track not found error that will be caught by the errorElement
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

  //console.log(actionData)
  

  return (
    <div className="h-full pb-16 flex flex-col ">
      <div className="basis-1/4 flex flex-col">
        <h1 className="basis-1/2 text-purple-200 font-bold text-3xl text-center py-3">
          Paste a Spotify Track Share Link
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center w-full ">
        <Form method='post'
          className='flex flex-col justify-center items-center w-full'>
          <label htmlFor="spotify-link"></label>
          <input ref={searchInputRef} type="text" name="spotify-link" 
          className="h-8 w-10/12 px-1 "/>
          <button type='submit' className="w-40 h-12 mt-4 bg-green-900 font-bold text-xl rounded-lg hover:bg-green-800">
            search
          </button>
        </Form>
      </div>
      <div className="flex flex-col justify-center items-center">
        {/*mayba implement search history functionality using redux
        <h3 className="text-purple-300 font-bold text-2xl pt-4">Search History</h3>
        <br/>
        <h4 className="text-purple-300 font-bold text-xl pt-2">(Under Construction)</h4>
        */}
      </div>
    </div>
  )
}
