import { useEffect, useState } from "react"
import { AudioFeatureSettings, ITrack, SongPreviewInfo, TrackSaveState, useTrackAndAudioFeatures } from "../interfaces";
import { redirect, useFetcher, useLoaderData } from "react-router-dom";
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
  const [modalSongList, setModalSongList] = useState<SongPreviewInfo[]>([]);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
  
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const actionData = fetcher.data;

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
    if(!Array.isArray(actionData)) return;
    const tempTrackList: ITrack[] = [];
    let possibleTrack: ITrack | null = null;

    for(let i = 0; i < actionData.length; i++){
      possibleTrack = null;
      if(typeof actionData[i].id === 'string' &&
        typeof actionData[i].name === 'string' &&
        typeof actionData[i].artist === 'string' &&
        Array.isArray(actionData[i].image) && actionData[i].image.length > 0 &&
        actionData[i].trackSaveState !== null){
        possibleTrack = {
          id: actionData[i].id,
          name: actionData[i].name,
          artist: actionData[i].artist,
          image: actionData[i].image,
          url: actionData[i].url ? actionData[i].url : null,
          trackSaveState: actionData[i].trackSaveState
        };
      }
      if(possibleTrack != null) tempTrackList.push(possibleTrack);
    }
    setRecList(tempTrackList);
    setIsLoadingRecs(false);
  }, [actionData]);

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


  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined, index?: number){
    if(songPreviewInfo === undefined){
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    if (recList.length > 0 && index !== undefined) {
      setModalSongList(recList.map((t) => ({ name: t.name, artist: t.artist, url: t.url ?? "", image: t.image[0] })));
      setModalCurrentIndex(index);
    } else {
      setModalSongList([]);
      setModalCurrentIndex(0);
    }
    setShowModal(true);
  }

  

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0"> 
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 flex flex-col flex-1 min-h-0">
          <nav className="flex items-stretch h-10 shrink-0 bg-zinc-800/80 border-b border-zinc-700/50 rounded-t-xl overflow-hidden">
            {/* Listen – action for current track (separate from tabs) */}
            <div className="flex items-center shrink-0 pl-2 border-r border-zinc-700/50">
              <button
                type="button"
                onClick={() => handleListenOnClick({ name: trackData.name, artist: trackData.artist, url: trackData.url ?? "", image: trackData.image?.[0] ?? "" }, undefined)}
                disabled={trackData.url == null || trackData.url === "" || trackData.url === " "}
                className="flex items-center justify-center gap-2 h-8 px-4 rounded-lg bg-green-600 text-white font-medium shadow-md shadow-green-900/40 hover:bg-green-500 hover:shadow-lg hover:shadow-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 disabled:shadow-md disabled:hover:shadow-green-900/40 transition-all"
                title="Listen to this track"
              >
                <img src={listenSvg} alt="" className="w-5 h-5 brightness-0 invert" />
                <span className="text-sm">Listen</span>
              </button>
            </div>
            {/* Tracks | Preferences – section tabs */}
            <div className="flex flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setIsSelectingOptions(false)}
                className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors ${!isSelectingOptions ? "bg-green-600 text-white" : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200"}`}
              >
                Tracks
              </button>
              <button
                type="button"
                onClick={() => setIsSelectingOptions(true)}
                className={`flex-1 flex items-center justify-center text-sm font-medium transition-colors ${isSelectingOptions ? "bg-green-600 text-white" : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200"}`}
              >
                Preferences
              </button>
            </div>
          </nav>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-zinc-900/30 border border-t-0 border-zinc-800/50 rounded-b-xl">
            {isSelectingOptions ? (
              <RecOptionsSection
                checkedBoxes={checkedBoxes}
                setCheckedBoxes={setCheckedBoxes}
                audioFeatures={currAudioFeatures}
                setIsSelectingOptions={setIsSelectingOptions}
                setIsLoadingRecs={setIsLoadingRecs}
                audioSettings={audioSettings}
                setAudioSettings={setAudioSettings}
                submitRecsRequest={(payload) => fetcher.submit(payload, { method: "post", encType: "application/json" })}
              />
            ) : (
              <RecList
                listTracks={recList}
                handleOnClick={handleListenOnClick}
                isLoadingRecs={isLoadingRecs}
              />
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <SongPreviewModal
          setShowModal={setShowModal}
          songPreviewInfo={modalSongPreviewInfo}
          songList={modalSongList.length > 0 ? modalSongList : undefined}
          currentIndex={modalCurrentIndex}
          onIndexChange={setModalCurrentIndex}
        />
      )}
    </>
  )
}