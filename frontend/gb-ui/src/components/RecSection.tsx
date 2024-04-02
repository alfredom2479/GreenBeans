import { useEffect, useState } from "react"
import { ITrack, SongPreviewInfo, TrackSaveState, useAudioFeatures, } from "../interfaces";
import { redirect, useActionData, useLoaderData } from "react-router-dom";
import RecOptionsSection from "./RecOptionsSection";
//import TrackCard from "./TrackCard";
import SongPreviewModal from "./SongPreviewModal";
import { isTrack } from "../utils";

import type {Params} from "react-router-dom";
import {  requestSaveStatus, requestSpotifyRec } from "../api";
import RecList from "./RecList";

interface LoaderParams{
  params:Params
}

export async function loader({params}:LoaderParams){
  let access_token: string|null = localStorage.getItem("access_token");
  let isLoggedIn = true;

  let trackId:string = "";
  
  if(!access_token || access_token == undefined){
    access_token = "";
    isLoggedIn = false;
  }

  if(params.trackid && typeof params.trackid === "string"){
    trackId = params.trackid;
  }
  else{
    redirect("/");
  }

  const data = await requestSpotifyRec(access_token,trackId,[],{},isLoggedIn);
  console.log(data);

  //return data.tracks;

  if(data.tracks && Array.isArray(data.tracks)){

    const trackData = data.tracks;
    const tempTrackList:ITrack[] = [];

    let possibleTrack: ITrack|null = null;

    for(let i=0; i < trackData.length;i++){
      possibleTrack = isTrack(trackData[i]);
      if(possibleTrack != null){
        tempTrackList.push(possibleTrack);
      }
    }

    if(!isLoggedIn){
      for(let i=0; i < tempTrackList.length;i++){
       tempTrackList[i].trackSaveState = TrackSaveState.CantSave;
      }
    }
    else{
      const saveStatusData = await requestSaveStatus(access_token, tempTrackList);

      if(Array.isArray(saveStatusData) && saveStatusData.length === tempTrackList.length){
        for(let i=0; i< tempTrackList.length; i++){
          if(saveStatusData[i] === true){
            tempTrackList[i].trackSaveState = TrackSaveState.Saved;
          }
          else {
            tempTrackList[i].trackSaveState = TrackSaveState.Saveable;
          }
        }
      }
      else{
        for(let i=0; i < tempTrackList.length; i++){
          tempTrackList[i].trackSaveState = TrackSaveState.Saveable;
        }
      }
    }
    return tempTrackList;
  }
  return [];
  
}

export default function RecSection(){

  const [checkedBoxes,setCheckedBoxes] = useState<string[]>([]);
  const [showModal,setShowModal] = useState(false);
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:""});
  
  const loaderData = useLoaderData();
  const actionData= useActionData();

  const [recList, setRecList] = useState<ITrack[]>([]);

  const [isSelectingOptions, setIsSelectingOptions] = useState<boolean>(false);

  const currAudioFeatures = useAudioFeatures();

  useEffect(()=>{
    /*
    if(Array.isArray(actionData)){
      const tempTrackList:ITrack[] = [];
      let possibleTrack: ITrack|null = null;
       for (let i=0; i< actionData.length;i++){
        possibleTrack = isTrack(actionData[i]);
        if(possibleTrack != null){
          tempTrackList.push(possibleTrack);
        }
       }
       setRecList(tempTrackList);
    }
    */
  if(Array.isArray(actionData)){
      const tempTrackList:ITrack[] = [];
      let possibleTrack: ITrack|null = null;

      for(let i=0; i < actionData.length;i++){
        possibleTrack = null;

        if(typeof actionData[i].id === 'string' && 
        typeof actionData[i].id === 'string' &&
        typeof actionData[i].name === 'string' &&
        typeof actionData[i].artist === 'string' &&
        typeof actionData[i].image === 'string' && 
        actionData[i].trackSaveState){

          possibleTrack = {
            id:actionData[i].id,
            name: actionData[i].name,
            artist: actionData[i].artist,
            image: actionData[i].image,
            url: actionData[i].url ? actionData[i].url : null,
            trackSaveState: actionData[i].trackSaveState
          }
          //console.log(possibleTrack.trackSaveState);

        }

        //possibleTrack = isTrack(loaderData[i]);
        if(possibleTrack != null){
          tempTrackList.push(possibleTrack);
        }
      }
      setRecList(tempTrackList);
    }
  }, [actionData])

  useEffect(()=>{

    setCheckedBoxes([]);
    
    /*
    if(Array.isArray(loaderData)){
      const tempTrackList:ITrack[] = [];
      let possibleTrack: ITrack|null = null;
       for (let i=0; i< loaderData.length;i++){
        possibleTrack = isTrack(loaderData[i]);
        if(possibleTrack != null){
          tempTrackList.push(possibleTrack);
        }
       }
       setRecList(tempTrackList);
    }
    */


    if(Array.isArray(loaderData)){
      const tempTrackList:ITrack[] = [];
      let possibleTrack: ITrack|null = null;

      for(let i=0; i < loaderData.length;i++){
        possibleTrack = null;

        if(typeof loaderData[i].id === 'string' && 
        typeof loaderData[i].id === 'string' &&
        typeof loaderData[i].name === 'string' &&
        typeof loaderData[i].artist === 'string' &&
        typeof loaderData[i].image === 'string' && 
        loaderData[i].trackSaveState){

          possibleTrack = {
            id:loaderData[i].id,
            name: loaderData[i].name,
            artist: loaderData[i].artist,
            image: loaderData[i].image,
            url: loaderData[i].url ? loaderData[i].url : null,
            trackSaveState: loaderData[i].trackSaveState
          }
          //console.log(possibleTrack.trackSaveState);

        }

        //possibleTrack = isTrack(loaderData[i]);
        if(possibleTrack != null){
          tempTrackList.push(possibleTrack);
        }
      }
      setRecList(tempTrackList);
    }
  },[loaderData])

  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined){
    if(songPreviewInfo === undefined){
      console.log("Song preview info is undefined");
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    setShowModal(true);
    return;
  }

  return(
    <>
    <nav className=" font-bold bg-purple-200 max-h-14">
          <ul className={`flex text-stone-900 h-full`}>
            <li className={`flex-1 flex justify-center `}>
              <button onClick={()=>setIsSelectingOptions(false)}
                className={!isSelectingOptions ? "text-stone-950 bg-purple-600 text-center w-full" : "text-center w-full"}>
                Recommendations
              </button>
            </li>
            <li className={`flex-1 flex justify-center `}>
              <button onClick={()=>setIsSelectingOptions(true)}  
                className={isSelectingOptions ? "text-stone-950 bg-purple-600 text-center w-full" : "text-center w-full"}>
                Options
              </button>
            </li>
            
          </ul>
        </nav>
        {isSelectingOptions
          ? <RecOptionsSection
              checkedBoxes={checkedBoxes}
              setCheckedBoxes={setCheckedBoxes}
              audioFeatures={currAudioFeatures}
              setIsSelectingOptions={setIsSelectingOptions}
            />
          : 
            <RecList
              listTracks={recList}
              handleOnClick={handleListenOnClick}
            />
        }
        {
          showModal 
            ? 
              <SongPreviewModal
                setShowModal={setShowModal}
                songPreviewInfo={modalSongPreviewInfo}
              />
            :
              null
        }
    </>
  )
}