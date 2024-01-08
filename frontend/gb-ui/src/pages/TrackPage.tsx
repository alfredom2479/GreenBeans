import {useState, useEffect} from "react";
import {redirect, useActionData, useLoaderData} from "react-router-dom";
import { requestSpotifyTrack,requestSpotifyTrackAudioFeatures } from "../api";
import type {Params} from "react-router-dom";
import RecOptionsSection from "../components/RecOptionsSection";
import { ITrack, AudioFeatures } from "../interfaces";
import TrackCard from "../components/TrackCard";
//import RecOptionsSection from "../components/RecOptionsSection";

interface IURLParams{
  params:Params
}

export async function loader({params}:IURLParams){
  console.log(params);
  
  let trackId:string = "bad_track_id";

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
  }

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    return redirect("/");
  }

  try{
    const trackLoaderData = await requestSpotifyTrack(access_token, trackId);

    const audioFeatureLoaderData = await requestSpotifyTrackAudioFeatures(access_token,trackId);
    //dont check anything about the data.
    //should be fine. Pretty simple return object
    //yolo
    //it got a little more complicated
    return {trackLoaderData,audioFeatureLoaderData};

  }catch(err){
    console.log("there has been a get-trackId error");
    console.log(err);
    throw(err);
  }

}

export default function TrackPage(){

  const [checkedBoxes,setCheckedBoxes] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewUrl, setModalSongPreviewUrl] = useState<string>("");

  const loaderData = useLoaderData();
  const actionData = useActionData();

  const [isSelectingOptions,setIsSelectingOptions] = useState<boolean>(true);

  const [trackData, setTrackData] = useState({name: "", artist: "", image:""});
  const [recList,setRecList] = useState<ITrack[]>([]);
  const [currAudioFeatures,setCurrAudioFeatures] = useState<AudioFeatures>({});
    
  useEffect(()=>{

    let trackLoaderData: object|null = {};
    let audioFeatureLoaderData: object|null = {};
    let tempName:string="";
    let tempArtist:string="";
    let tempImageUrl:string="";

    //Split loaderData into trackLoaderData and audioFeatureLoaderData
    if(typeof loaderData === 'object' && loaderData) { 
      if('trackLoaderData' in loaderData  &&
        typeof loaderData.trackLoaderData==='object'){
          trackLoaderData = loaderData.trackLoaderData;
      }
      if('audioFeatureLoaderData' in loaderData &&
        typeof loaderData.audioFeatureLoaderData === 'object'){
          audioFeatureLoaderData = loaderData.audioFeatureLoaderData
        }
    }
    
    //Construct current ITrack object
    if(typeof trackLoaderData === 'object' && trackLoaderData ){
      if('name' in trackLoaderData && typeof trackLoaderData.name === "string"){
        tempName = trackLoaderData.name;
      }
      if('artists' in trackLoaderData && Array.isArray(trackLoaderData.artists) ){
        if(trackLoaderData.artists.length >0 && trackLoaderData.artists[0].name){
          tempArtist = trackLoaderData.artists[0].name
        }
      }
      if('album' in trackLoaderData && typeof trackLoaderData.album === 'object' && trackLoaderData.album){
        
        if('images' in trackLoaderData.album && Array.isArray(trackLoaderData.album.images)){
          if(trackLoaderData.album.images.length > 0 && trackLoaderData.album.images[trackLoaderData.album.images.length-1].url){
            tempImageUrl = trackLoaderData.album.images[trackLoaderData.album.images.length-2].url;
          }
        }
      }
      setTrackData({name: tempName, artist: tempArtist, image: tempImageUrl});
    
      if(typeof audioFeatureLoaderData === 'object' && audioFeatureLoaderData){
        console.log("audio feature data shape:");
        const tempAudioFeatures:AudioFeatures = {}
        if('acousticness' in audioFeatureLoaderData && typeof audioFeatureLoaderData.acousticness === "number"){
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
    for(let i=0; i < actionData.length;i++){
      const tempTrackInfo:ITrack = {id:"",name:"",artist:"",image:""}
      if(actionData[i].id){
        tempTrackInfo.id= actionData[i].id
      }
      if(actionData[i].name){
        tempTrackInfo.name = actionData[i].name;
      }
      if(actionData[i].artists){
        if(Array.isArray(actionData[i].artists) && actionData[i].artists.length > 0){
          tempTrackInfo.artist = actionData[i].artists[0].name
        }
      }
      if(actionData[i].album && actionData[i].album.images){
        if(Array.isArray(actionData[i].album.images)
          && actionData[i].album.images.length > 0){
            tempTrackInfo.image = actionData[i].album.images[actionData[i].album.images.length-1].url;
          }
      }
      if(actionData[i].preview_url){
        tempTrackInfo.url = actionData[i].preview_url;
      }
      else if(actionData[i].external_urls && actionData[i].external_urls.spotify){
        tempTrackInfo.url = actionData[i].external_urls.spotify
      }
      tempTrackList.push(tempTrackInfo);
    }
    setRecList(tempTrackList);
   } 
  },[actionData]);

  useEffect(()=>{
    setIsSelectingOptions(true)
    setCheckedBoxes([]);
    setRecList([]) 
      
  },[trackData]);


  function handleListenOnClick(songPreviewUrl:string|undefined) {
    if(songPreviewUrl === undefined){
      console.log("Song Preview url is undefined");
      return;
    }
    setModalSongPreviewUrl(songPreviewUrl);
    setShowModal(true);
    return;
  }

  return(
    <div className="flex flex-col h-screen min-h-screen max-h-screen">
      <div className=" flex flex-col basis-1/4 grow-0 max-h-[25%]">
      <div className=" bg-stone-900 text-purple-200 flex max-h-[80%]">
        <div className="basis-5/12 flex items-center max-h-full">
          <img src={trackData.image}
          className="flex-1 object-cover max-h-full">
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
      <nav className=" font-bold bg-purple-200 max-h-fit">
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
        : <div className="basis-3/4  overflow-y-scroll">
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
                    />
                  </li>
                )
              })}
            </ul>
          </div>
      }
      <div className="flex mt-2">
      <a 
        href="/real-top/month"
        className="flex flex-1 items-center justify-center  bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-t-2 border-r-2 hover:border-purple-600"
        >top
      </a>
      <a 
        href="/saved/0"
        className="flex flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-t-2 border-l-2 hover:border-purple-600"
        >saved
      </a>
      <a 
        href="/link-search"
        className="flex flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold  mb-0 text-center border-white border-t-2 border-l-2 hover:border-purple-600"
        >search
      </a>
      </div>
     {showModal ?
      <div className="z-10 fixed h-full w-full left-0 top-0 pt-48 bg-[rgba(0,0,0,.4)]"
      onClick={()=>{setShowModal(false)}}>
        <div className="bg-gray-50 m-auto w-10/12 flex justify-center">
          <iframe className="m-2" src={modalSongPreviewUrl}/>
        </div>
    
      </div>
      :
      null
    }

    </div>
  )
}

