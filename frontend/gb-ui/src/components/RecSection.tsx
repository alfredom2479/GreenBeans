import { useEffect, useState } from "react"
import { ITrack, SongPreviewInfo, TrackSaveState, useAudioFeatures, } from "../interfaces";
import {  redirect, useActionData, useLoaderData } from "react-router-dom";
import RecOptionsSection from "./RecOptionsSection";
import SongPreviewModal from "./SongPreviewModal";
import { isTrack } from "../utils";

import type {Params} from "react-router-dom";
import {  requestSaveStatus, requestSpotifyRec } from "../api";
import RecList from "./RecList";

interface LoaderParams{
  params:Params
}

export async function loader({params}:LoaderParams){
  const access_token_original: string|null = localStorage.getItem("access_token");
  const access_token:string = access_token_original === null || access_token_original === undefined ? "" :access_token_original
  let isLoggedIn = true;

  let trackId:string = "";
  
  if(access_token === ""){
    isLoggedIn = false;
  }

  if(params.trackid && typeof params.trackid === "string"){
    trackId = params.trackid;
  }
  else{
    redirect("/");
  }

  return {trackId,isLoggedIn,access_token}
  
}

export default function RecSection(){

  const [checkedBoxes,setCheckedBoxes] = useState<string[]>([]);
  const [showModal,setShowModal] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:""});
  
  const loaderData = useLoaderData();
  const actionData= useActionData();

  const [recList, setRecList] = useState<ITrack[]>([]);

  const [isSelectingOptions, setIsSelectingOptions] = useState<boolean>(false);

  const currAudioFeatures = useAudioFeatures();

  
  useEffect(()=>{
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
        actionData[i].trackSaveState !== null){

          possibleTrack = {
            id:actionData[i].id,
            name: actionData[i].name,
            artist: actionData[i].artist,
            image: actionData[i].image,
            url: actionData[i].url ? actionData[i].url : null,
            trackSaveState: actionData[i].trackSaveState
          }
        }
        if(possibleTrack != null){
          tempTrackList.push(possibleTrack);
        }
      }
      setRecList(tempTrackList);
      setIsLoadingRecs(false);
    }
  }, [actionData])
  
  useEffect(()=>{

    setCheckedBoxes([]);

    const testFunc = async (token:string,id:string,isLoggedIn:boolean)=>{
      if(!ignore){
        setIsLoadingRecs(true);
      }
      const data = await requestSpotifyRec(token,id,[],{},isLoggedIn);

      if(data.tracks && Array.isArray(data.tracks)){
        const trackData = data.tracks;
        const tempTrackList:ITrack[] = [];
        
        let possibleTrack:ITrack|null = null;

         for(let i=0; i <trackData.length;i++){
          possibleTrack = isTrack(trackData[i]);
          if(possibleTrack != null){
            tempTrackList.push(possibleTrack);
          }
         }

         if(!isLoggedIn){
          for(let i=0; i <tempTrackList.length; i++){
            tempTrackList[i].trackSaveState = TrackSaveState.CantSave;
          }
         }
         else{
          const saveStatusData = await requestSaveStatus(token,tempTrackList);

          if(Array.isArray(saveStatusData) && saveStatusData.length === tempTrackList.length){
            for(let i=0; i <tempTrackList.length;i++){
              if(saveStatusData[i] === true){
                tempTrackList[i].trackSaveState = TrackSaveState.Saved;
              }
              else{
                tempTrackList[i].trackSaveState = TrackSaveState.Saveable;
              }
            }
          }
          else{
            for(let i=0; i <tempTrackList.length; i++){
              tempTrackList[i].trackSaveState = TrackSaveState.CantSave;
            }
          }
         }
        if(!ignore){
          setRecList(tempTrackList);
          setIsLoadingRecs(false);
       }
      }
    }
    
    let ignore = false;
    if(typeof loaderData == 'object' && loaderData){
      if('trackId' in loaderData && typeof loaderData.trackId === "string" && loaderData.trackId.length > 0){
        if('access_token' in loaderData && typeof loaderData.access_token === "string" &&
          'isLoggedIn' in loaderData && typeof loaderData.isLoggedIn === "boolean"){
            testFunc(loaderData.access_token,loaderData.trackId,loaderData.isLoggedIn);
            return () =>{
              ignore = true; 
            }
          }
      }
    }
  },[loaderData])


  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined){
    if(songPreviewInfo === undefined){
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
              setIsLoadingRecs={setIsLoadingRecs}
            />
          :
              <RecList
                listTracks={recList}
                handleOnClick={handleListenOnClick}
                isLoadingRecs={isLoadingRecs}
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