import { useEffect, useState } from "react"
import { ITrack, SongPreviewInfo, TrackSaveState, useAudioFeatures } from "../interfaces";
import {  redirect, useActionData, useLoaderData } from "react-router-dom";
import RecOptionsSection from "./feature-settings/RecOptionsSection";
import SongPreviewModal from "./modals/SongPreviewModal";
import { isTrack } from "../utils";

import type {Params} from "react-router-dom";
import {  requestSaveStatus, requestSpotifyRec } from "../api";
import RecList from "./lists/RecList";
import { addTracksToDidb, getTrackListFromDidb } from "../utils";
import listenSvg from "../assets/listen.svg";
//import { getData, Stores } from "../idb";

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

  const currAudioFeatures = useAudioFeatures().currAudioFeatures;
  const trackData = useAudioFeatures().trackData;


  const [acousticnessSettings, setAcousticnessSettings] = useState<{min:number, max:number}>({min: 0, max: 1});
  const [danceabilitySettings, setDanceabilitySettings] = useState<{min:number, max:number}>({min: 0, max: 1});
  const [energySettings, setEnergySettings] = useState<{min:number, max:number}>({min: 0, max: 1});
  const [valenceSettings, setValenceSettings] = useState<{min:number, max:number}>({min: 0, max: 1});
  const [tempoSettings, setTempoSettings] = useState<{min:number, max:number}>({min: 0, max: 200});
  const [keySettings, setKeySettings] = useState<number>(currAudioFeatures.key || 0);
  const [modeSettings, setModeSettings] = useState<boolean>(currAudioFeatures.mode === 0 ? false: true);
  const [durationSettings, setDurationSettings] = useState<{min:number, max:number}>({min: 0, max: 600});

  
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
    setAcousticnessSettings({min: 0, max: 1});
    setDanceabilitySettings({min: 0, max: 1});
    setEnergySettings({min: 0, max: 1});
    setValenceSettings({min: 0, max: 1});
    setTempoSettings({min: 0, max: 200});
    setKeySettings(currAudioFeatures.key || 0);
    setModeSettings(currAudioFeatures.mode === 0 ? false: true);
    setDurationSettings({min: 0, max: 600});
    setIsSelectingOptions(false);


    const testFunc = async (token:string,id:string,isLoggedIn:boolean)=>{
      if(!ignore){
        setIsLoadingRecs(true);
      }

      //const idbTrackListData:ITrack[]|null = await getTrackList(Stores.TrackLists,id);
      let didbTrackListData:ITrack[]|null=null;

      try{
        didbTrackListData= await getTrackListFromDidb(id) ;
        //console.log(didbTrackListData);
      }
      catch(err){
        console.log("error getting track list from dexie ");
        console.log(err);
      }
      //console.log(idbTrackListData);

      if(didbTrackListData !== null ){
          setRecList(didbTrackListData);
          setIsLoadingRecs(false)
          return;
      }

      let data = null;
      data = await requestSpotifyRec(token,
        id,
        [],
        currAudioFeatures,
        {
          key: 0,
          mode: true,
          acousticness: {min: 0, max: 1},
          danceability: {min: 0, max: 1},
          energy: {min: 0, max: 1},
          valence: {min: 0, max: 1},
          tempo: {min: 0, max: 200},
          duration_ms: {min: 0, max: 600}
        },
        isLoggedIn);

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
          //console.log(tempTrackList);
          setRecList(tempTrackList);
          if(didbTrackListData === null){
            //addTrackList(Stores.TrackLists ,tempTrackList,id);
            addTracksToDidb(tempTrackList,id);
          }
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
    console.log(songPreviewInfo);
    if(songPreviewInfo === undefined){
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    setShowModal(true);
    return;
  }


  return(
    <>
    <nav className=" font-bold bg-stone-200 max-h-14">
          <ul className={`flex  h-full`}>
            <li className="flex-1 flex justify-center bg-stone-100 border-1  border-stone-900">
              <button 
                onClick={()=>handleListenOnClick({name:trackData.name,artist:trackData.artist,url:trackData.url?trackData.url:""})}
                disabled={trackData.url === null || trackData.url === undefined}
                className="bg-stone-200 w-full text-center flex items-center justify-center disabled:bg-stone-600 disabled:cursor-not-allowed hover:bg-green-700">
                <img src={listenSvg} alt="listen" className="w-6"/>
              </button>
            </li>
            <li className={` flex-[2_2_0%] flex justify-center `}>
              <button onClick={()=>setIsSelectingOptions(false)}
                className={!isSelectingOptions ? " bg-green-600 text-center w-full " : "text-center w-full hover:bg-green-700"}>
                  Tracks
              </button>
            </li>
            <li className={` flex-[2_2_0%] flex justify-center `}>
              <button onClick={()=>setIsSelectingOptions(true)}  
                className={isSelectingOptions ? " bg-green-600 text-center w-full " : "text-center w-full hover:bg-green-700"}>
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
              acousticnessSettings={acousticnessSettings}
              setAcousticnessSettings={setAcousticnessSettings}
              danceabilitySettings={danceabilitySettings}
              setDanceabilitySettings={setDanceabilitySettings}
              energySettings={energySettings}
              setEnergySettings={setEnergySettings}
              valenceSettings={valenceSettings}
              setValenceSettings={setValenceSettings}
              tempoSettings={tempoSettings}
              setTempoSettings={setTempoSettings}
              keySettings={keySettings}
              setKeySettings={setKeySettings}
              modeSettings={modeSettings}
              setModeSettings={setModeSettings}
              durationSettings={durationSettings}
              setDurationSettings={setDurationSettings}
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