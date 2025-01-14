import { useEffect, useState } from "react"
import { AudioFeatureSettings, ITrack, SongPreviewInfo, TrackSaveState, useTrackAndAudioFeatures } from "../interfaces";
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
  //console.log("trackId",trackId);

  return {trackId,isLoggedIn,access_token}
  
}

export default function RecSection(){

  const [checkedBoxes,setCheckedBoxes] = useState<string[]>([]);
  const [showModal,setShowModal] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:"",image:""});
  
  const loaderData = useLoaderData();
  const actionData= useActionData();
  //console.log("actionData",actionData);

  const [recList, setRecList] = useState<ITrack[]>([]);

  const [isSelectingOptions, setIsSelectingOptions] = useState<boolean>(false);

  const {currAudioFeatures,trackData} = useTrackAndAudioFeatures();
  //const currAudioFeatures = useAudioFeatures().currAudioFeatures;
  //const trackData = useAudioFeatures().trackData;


  const [audioSettings,setAudioSettings] = useState<AudioFeatureSettings>(
    {
      id: currAudioFeatures.id,
      acousticness: currAudioFeatures.acousticness || 0,
      danceability: currAudioFeatures.danceability || 0,
      energy: currAudioFeatures.energy || 0,
      valence: currAudioFeatures.valence || 0,
      tempo: currAudioFeatures.tempo || 0,
      key: currAudioFeatures.key || 0,
      mode: currAudioFeatures.mode === 0 ? false: true,
      duration_ms: currAudioFeatures.duration_ms || 0,
      popularity: 50
    }
  );

  
  useEffect(()=>{
    //console.log("actionData",actionData);
  if(Array.isArray(actionData)){
      const tempTrackList:ITrack[] = [];
      let possibleTrack: ITrack|null = null;

      for(let i=0; i < actionData.length;i++){
        possibleTrack = null;

        if(typeof actionData[i].id === 'string' && 
        typeof actionData[i].id === 'string' &&
        typeof actionData[i].name === 'string' &&
        typeof actionData[i].artist === 'string' &&
        Array.isArray(actionData[i].image) && actionData[i].image.length > 0 && 
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
      //console.log("tempTrackList",tempTrackList);
    }
  }, [actionData])

  useEffect(()=>{
    if(audioSettings.id === "" || currAudioFeatures.id !== audioSettings.id){
      setAudioSettings(
        {
          id: currAudioFeatures.id,
          acousticness: currAudioFeatures.acousticness || 0,
          danceability: currAudioFeatures.danceability || 0,
          energy: currAudioFeatures.energy || 0,
          valence: currAudioFeatures.valence || 0,
          tempo: currAudioFeatures.tempo || 0,
          key: currAudioFeatures.key || 0,
          mode: currAudioFeatures.mode === 0 ? false: true,
          duration_ms: currAudioFeatures.duration_ms ? currAudioFeatures.duration_ms : 0,
          popularity: 50 
        }
      );
    }

    //console.log("currAudioFeatures",currAudioFeatures);
    //console.log("audioSettings",audioSettings);
  },[currAudioFeatures])

  
  useEffect(()=>{

    setCheckedBoxes([]);
    setIsSelectingOptions(false);

    if(currAudioFeatures.id !== "" ){
      setAudioSettings(
        {
          id: currAudioFeatures.id,
          acousticness: currAudioFeatures.acousticness || 0,
          danceability: currAudioFeatures.danceability || 0,
          energy: currAudioFeatures.energy || 0,
          valence: currAudioFeatures.valence || 0,
          tempo: currAudioFeatures.tempo || 0,
          key: currAudioFeatures.key || 0,
          mode: currAudioFeatures.mode === 0 ? false: true,
          duration_ms: currAudioFeatures.duration_ms || 0,
          popularity: 50 
        }
      )
    }


    const getAndSetDefaultRecs = async (token:string,id:string,isLoggedIn:boolean)=>{
      //console.log(" in getAndSetDefaultRecs");
      if(!ignore){
        setIsLoadingRecs(true);
      }

      //const idbTrackListData:ITrack[]|null = await getTrackList(Stores.TrackLists,id);
      let didbTrackListData:ITrack[]|null=null;

      try{
        didbTrackListData= await getTrackListFromDidb(id) ;
      }
      catch(err){
        console.log("error getting track list from dexie ");
        console.log(err);
      }


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
          id: "",
          key: 0,
          mode: true,
          acousticness: 0,
          danceability: 0,
          energy: 0,
          valence: 0,
          tempo: 0,
          duration_ms: 0,
          popularity: .50 
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
          setRecList(tempTrackList);
          if(didbTrackListData === null){
            addTracksToDidb(tempTrackList,id);
            //addTracksToDidb(tempTrackList,id);
          }
          setIsLoadingRecs(false);
       }
      }
    }
    
    let ignore = false;
    //console.log("loaderData",loaderData);
    if(typeof loaderData == 'object' && loaderData){
      if('trackId' in loaderData && typeof loaderData.trackId === "string" && loaderData.trackId.length > 0){
        if('access_token' in loaderData && typeof loaderData.access_token === "string" &&
          'isLoggedIn' in loaderData && typeof loaderData.isLoggedIn === "boolean"){

            
            getAndSetDefaultRecs(loaderData.access_token,loaderData.trackId,loaderData.isLoggedIn);
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
    <div className="flex flex-col h-[calc(100%-8rem)]">
    <nav className=" font-bold bg-stone-200 h-8  ">
          <ul className={`flex  h-full`}>
            <li className="flex-1 flex justify-center bg-stone-100 border-1  border-stone-900">
              <button 
                onClick={()=>handleListenOnClick({name:trackData.name,artist:trackData.artist,url:trackData.url?trackData.url:"",image:trackData.image?trackData.image[0]:""})}
                disabled={trackData.url === null || trackData.url === undefined || trackData.url === "" || trackData.url === " "}
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
                  Preferences
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
              audioSettings={audioSettings}
              setAudioSettings={setAudioSettings}
            />
          :
              <RecList
                listTracks={recList}
                handleOnClick={handleListenOnClick}
                isLoadingRecs={isLoadingRecs}
              />
}

        </div>
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