import { useEffect, useState } from "react"
import { AudioFeatureSettings, ITrack, SongPreviewInfo, TrackSaveState, useTrackAndAudioFeatures } from "../interfaces";
import { redirect, useFetcher, useLoaderData } from "react-router-dom";
import RecOptionsSection from "./feature-settings/RecOptionsSection";
import SongPreviewModal from "./modals/SongPreviewModal";
import { isTrack } from "../utils";

import type {Params} from "react-router-dom";
import { mergeSaveStatusIntoTracks, requestSpotifyRec } from "../api";
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
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
  const [modalTrackList, setModalTrackList] = useState<ITrack[]>([]);
  
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const actionData = fetcher.data;

  const [recList, setRecList] = useState<ITrack[]>([]);

  const [isSelectingOptions, setIsSelectingOptions] = useState<boolean>(false);

  const {currAudioFeatures, trackData, onTrackSaved: onTrackSavedFromContext, onTrackUnsaved: onTrackUnsavedFromContext} = useTrackAndAudioFeatures();
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
          if(!isLoggedIn){
            const list = didbTrackListData.map((t) => ({ ...t, trackSaveState: TrackSaveState.CantSave }));
            if(!ignore){ setRecList(list); setIsLoadingRecs(false); }
            return;
          }
          const merged = await mergeSaveStatusIntoTracks(token, didbTrackListData);
          if(!ignore){ setRecList(merged); setIsLoadingRecs(false); }
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

        let listToShow: ITrack[];
        if(!isLoggedIn){
          listToShow = tempTrackList.map((t) => ({ ...t, trackSaveState: TrackSaveState.CantSave }));
        }
        else{
          listToShow = await mergeSaveStatusIntoTracks(token, tempTrackList);
        }
        if(!ignore){
          setRecList(listToShow);
          if(didbTrackListData === null){
            addTracksToDidb(listToShow,id);
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


  const [hideFindRecsInModal, setHideFindRecsInModal] = useState(false);

  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined, index?: number, trackList?: ITrack[]){
    if(songPreviewInfo === undefined){
      return;
    }
    setModalSongPreviewInfo(songPreviewInfo);
    if (trackList && trackList.length > 0 && index !== undefined) {
      setModalTrackList(trackList);
      setModalCurrentIndex(index);
      setHideFindRecsInModal(false);
    } else {
      setModalTrackList([trackData]);
      setModalCurrentIndex(0);
      setHideFindRecsInModal(true);
    }
    setShowModal(true);
  }

  

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 pb-6 flex flex-col flex-1 min-h-0">
          <nav
            className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 shrink-0"
            aria-label="Track actions and sections"
          >
            <button
              type="button"
              onClick={() => handleListenOnClick({ name: trackData.name, artist: trackData.artist, url: trackData.url ?? "", image: trackData.image?.[0] ?? "" }, undefined, undefined)}
              disabled={trackData.url == null || trackData.url === "" || trackData.url === " "}
              className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 transition-colors shrink-0"
              title="Listen to this track"
            >
              <img src={listenSvg} alt="" className="w-4 h-4 brightness-0 invert" />
              <span>Listen</span>
            </button>
            <div className="flex-1 flex rounded-lg overflow-hidden bg-zinc-800/80 border border-zinc-700/50">
              <button
                type="button"
                onClick={() => setIsSelectingOptions(false)}
                className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium transition-colors ${!isSelectingOptions ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-700/70"}`}
              >
                Tracks
              </button>
              <button
                type="button"
                onClick={() => setIsSelectingOptions(true)}
                className={`flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium transition-colors ${isSelectingOptions ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-700/70"}`}
              >
                Preferences
              </button>
            </div>
          </nav>

          <div className="flex-1 flex flex-col min-h-0 mt-3 rounded-xl overflow-hidden bg-zinc-900/30 border border-zinc-800/50">
            <div className="flex-1 min-h-0 overflow-y-scroll">
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
      </div>
      {showModal && (
        <SongPreviewModal
          setShowModal={setShowModal}
          songPreviewInfo={modalSongPreviewInfo}
          currentIndex={modalCurrentIndex}
          onIndexChange={setModalCurrentIndex}
          trackList={modalTrackList.length > 0 ? modalTrackList : undefined}
          hideFindRecs={hideFindRecsInModal}
          onTrackSaved={(track) => {
            setRecList((prev) => prev.map((t) => t.id === track.id ? { ...t, trackSaveState: TrackSaveState.Saved } : t));
            onTrackSavedFromContext?.(track);
          }}
          onTrackUnsaved={(track) => {
            setRecList((prev) => prev.map((t) => t.id === track.id ? { ...t, trackSaveState: TrackSaveState.Saveable } : t));
            onTrackUnsavedFromContext?.(track);
          }}
        />
      )}
    </>
  )
}