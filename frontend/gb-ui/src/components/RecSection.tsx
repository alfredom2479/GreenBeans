import { useEffect, useState } from "react"
import { ITrack, SongPreviewInfo, TrackSaveState, useAudioFeatures, } from "../interfaces";
import { redirect, useActionData, useLoaderData } from "react-router-dom";
import RecOptionsSection from "./RecOptionsSection";
import TrackCard from "./TrackCard";
import SongPreviewModal from "./SongPreviewModal";
import { isTrack } from "../utils";

import type {Params} from "react-router-dom";
import { requestSpotifyRec } from "../api";

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

  if(data.tracks && Array.isArray(data.tracks)){
    return data.tracks;
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
  }, [actionData])

  useEffect(()=>{

    setCheckedBoxes([]);

    if(Array.isArray(loaderData)){
      const tempTrackList:ITrack[] = [];
      let possibleTrack: ITrack|null = null;
      for(let i=0; i < loaderData.length;i++){
        possibleTrack = isTrack(loaderData[i]);
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
          : <div className="overflow-y-scroll">
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
                      popModal={handleListenOnClick}
                      trackSaveState={TrackSaveState.Saveable}
                      />
                  </li>
                )
              })}
            </ul>
          </div>
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