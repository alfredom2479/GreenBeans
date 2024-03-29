import {useState, useEffect} from "react";
import {useActionData, useLoaderData} from "react-router-dom";
import { requestSpotifyTrack,requestSpotifyTrackAudioFeatures } from "../api";
import type {Params} from "react-router-dom";
import RecOptionsSection from "../components/RecOptionsSection";
import { ITrack, AudioFeatures, SongPreviewInfo, TrackSaveState, } from "../interfaces";
import TrackCard from "../components/TrackCard";
import { isTrack } from "../utils";
import SongPreviewModal from "../components/SongPreviewModal";
//import RecOptionsSection from "../components/RecOptionsSection";

interface IURLParams{
  params:Params
}

export async function loader({params}:IURLParams){
  console.log(params);
  
  let trackId:string = "bad_track_id";
  let isLoggedIn = true;

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
  }

  let access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    isLoggedIn = false;
    access_token = "";
  }

  const trackLoaderData = await requestSpotifyTrack(access_token, trackId, isLoggedIn);
  const audioFeatureLoaderData = await requestSpotifyTrackAudioFeatures(access_token,trackId, isLoggedIn);
  return {trackLoaderData,audioFeatureLoaderData};


}

export default function TrackPage(){

  const [checkedBoxes,setCheckedBoxes] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:""});

  const loaderData = useLoaderData();
  const actionData = useActionData();

  const [isSelectingOptions,setIsSelectingOptions] = useState<boolean>(true);

  const [trackData, setTrackData] = useState({name: "", artist: "", image:""});
  const [recList,setRecList] = useState<ITrack[]>([]);
  const [currAudioFeatures,setCurrAudioFeatures] = useState<AudioFeatures>({});
    
  useEffect(()=>{

    let trackLoaderData: object|null = {};
    let audioFeatureLoaderData: object|null = {};

    if(typeof loaderData === 'object' && loaderData) { 
      if('trackLoaderData' in loaderData  &&
        typeof loaderData.trackLoaderData==='object' &&
        'audioFeatureLoaderData' in loaderData &&
        typeof loaderData.audioFeatureLoaderData === 'object'
        ){
          trackLoaderData = loaderData.trackLoaderData;
          audioFeatureLoaderData = loaderData.audioFeatureLoaderData
      }
      else{
        trackLoaderData = {};
        audioFeatureLoaderData = {};
      }
    }
    else{
        trackLoaderData = {};
        audioFeatureLoaderData = {};
    }

    if(typeof trackLoaderData === 'object' && trackLoaderData ){

      const possibleTrack: ITrack|null = isTrack(trackLoaderData,1);
      if(possibleTrack != null){
        setTrackData(possibleTrack)
      }

      if(typeof audioFeatureLoaderData === 'object' && audioFeatureLoaderData){
        const tempAudioFeatures:AudioFeatures = {}

        if('acousticness' in audioFeatureLoaderData && typeof audioFeatureLoaderData['acousticness'] === "number"){
          tempAudioFeatures.acousticness = audioFeatureLoaderData.acousticness
        }
        if('danceability' in audioFeatureLoaderData && typeof audioFeatureLoaderData.danceability === "number"){
            tempAudioFeatures.danceability = audioFeatureLoaderData.danceability
        }
        if('energy' in audioFeatureLoaderData && typeof audioFeatureLoaderData.energy === "number"){
            tempAudioFeatures.energy = audioFeatureLoaderData.energy
        }
        if('liveness' in audioFeatureLoaderData && typeof audioFeatureLoaderData.liveness === "number"){
            tempAudioFeatures.liveness = audioFeatureLoaderData.liveness
        }
        if('valence' in audioFeatureLoaderData && typeof audioFeatureLoaderData.valence === "number"){
            tempAudioFeatures.valence = audioFeatureLoaderData.valence
        }
        if('tempo' in audioFeatureLoaderData && typeof audioFeatureLoaderData.tempo=== "number"){
            tempAudioFeatures.tempo = audioFeatureLoaderData.tempo
        }
        if('duration_ms' in audioFeatureLoaderData && typeof audioFeatureLoaderData.duration_ms=== "number"){
            tempAudioFeatures.duration_ms = audioFeatureLoaderData.duration_ms
        }
        if('time_signature' in audioFeatureLoaderData && typeof audioFeatureLoaderData.time_signature=== "number"){
            tempAudioFeatures.time_signature = audioFeatureLoaderData.time_signature
        }
        if('instrumentalness' in audioFeatureLoaderData && typeof audioFeatureLoaderData.instrumentalness=== "number"){
            tempAudioFeatures.instrumentalness= audioFeatureLoaderData.instrumentalness
        }
        if('key' in audioFeatureLoaderData && typeof audioFeatureLoaderData.key === "number"){
            tempAudioFeatures.key= audioFeatureLoaderData.key
        }
        if('mode' in audioFeatureLoaderData && typeof audioFeatureLoaderData.mode === "number"){
            tempAudioFeatures.mode = audioFeatureLoaderData.mode
        }
        setCurrAudioFeatures(tempAudioFeatures);
      }
    }
    
  },[loaderData])

  useEffect(()=>{
   if(Array.isArray(actionData)){
    const tempTrackList:ITrack[] = [];
    let possibleTrack:ITrack|null = null

    for(let i=0; i < actionData.length;i++){
      possibleTrack = isTrack(actionData[i]);
      if(possibleTrack != null){
        tempTrackList.push(possibleTrack)
      }
    }
    setRecList(tempTrackList);
   } 
  },[actionData]);

  useEffect(()=>{
    setIsSelectingOptions(true)
    setCheckedBoxes([]);
    setRecList([]) 
      
  },[trackData]);


  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined) {
    if(songPreviewInfo === undefined){
      console.log("Song Preview info is undefined");
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    setShowModal(true);
    return;
  }

  return(
    <div className=" h-full w-full flex flex-col  pb-16 ">

      <div className=" flex flex-col basis-1/4 w-full ">

        <div className=" bg-stone-900 text-purple-200 flex max-h-[95%]">
          <div className="basis-5/12 flex items-center h-full">
            <img src={trackData.image} 
              className="flex-1 max-h-[25vh] object-cover">
            </img>
          </div>

          <div className="basis-7/12">
            <div className="text-2xl">
              {trackData.name}
            </div>
            <div className="text-purple-300">
              <i>{trackData.artist}</i>
            </div>
          </div>

        </div> 

        <nav className=" font-bold bg-purple-200 max-h-14">
          <ul className={`flex text-stone-900 h-full`}>
            <li className={`flex-1 flex justify-center `}>
              <button onClick={()=>setIsSelectingOptions(true)}  
                className={isSelectingOptions ? "text-stone-950 bg-purple-600 text-center w-full" : "text-center w-full"}>
                Options
              </button>
            </li>
            <li className={`flex-1 flex justify-center `}>
              <button onClick={()=>setIsSelectingOptions(false)}
                className={!isSelectingOptions ? "text-stone-950 bg-purple-600 text-center w-full" : "text-center w-full"}>
                Recommendations
              </button>
            </li>
          </ul>
        </nav>
      </div>

      { isSelectingOptions 
        ? <RecOptionsSection 
            checkedBoxes={checkedBoxes} 
            setCheckedBoxes={setCheckedBoxes} 
            audioFeatures={currAudioFeatures}
            setIsSelectingOptions={setIsSelectingOptions}
          /> 
        : <div className=" overflow-y-scroll">
            <ul>
              {recList.map((track)=>{
                return (
                  <li key={track.id}>
                    <TrackCard
                      id={track.id}
                      name={track.name}
                      artist={track.artist}
                      image={track.image}
                      url={track.url}
                      isRec={true}
                      popModal={handleListenOnClick}
                      trackSaveState={TrackSaveState.Saveable}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
      }
     {showModal ?
     <SongPreviewModal 
      setShowModal={setShowModal} 
      songPreviewInfo={modalSongPreviewInfo}
      />
      :
      null
    }

    </div>
  )
}

