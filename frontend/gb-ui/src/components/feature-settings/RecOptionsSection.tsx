import {  redirect,useSubmit } from "react-router-dom";
import type {Params} from "react-router-dom";
import { AudioFeatures, ITrack, TrackSaveState, AudioFeatureSettings } from "../../interfaces";
import { requestSaveStatus, requestSpotifyRec } from "../../api";
import { isTrack, getAudioFeatureReadableData } from "../../utils";
import FeatureSettingsBox from "./FeatureSettingsBox";
import BoolFeatureSettingsBox from "./BoolFeatureSettingsBox";
import OptionFeatureSettBox from "./OptionFeatureSettBox";

interface IURLParams{
  params: Params,
  request: Request
}

export async function action({params,request}:IURLParams){  
  let access_token:string|null = localStorage.getItem("access_token");
  let isLoggedIn = true;
  let trackId:string = "";

  if(!access_token || access_token === undefined || access_token===""){
    access_token = "";
    isLoggedIn = false;
  }


  if (typeof params.trackid === "string") trackId = params.trackid;
  else redirect("/");
  
  let audioFeatures:AudioFeatures = {id:""};
  let settings:string[] = [];
  let audioFeatureSettings:AudioFeatureSettings = {
    id: "",
    acousticness: 0,
    danceability: 0,
    energy: 0,
    valence: 0,
    tempo: 0,
    duration_ms: 0,
    key: 0,
    mode: false,
    popularity: 50
  };

  const requestJson = await request.json();
  audioFeatures = requestJson.audioFeatures;
  settings = requestJson.settings;
  audioFeatureSettings = requestJson.audioFeatureSettings;

  //console.log(audioFeatureSettings);

  const data = await requestSpotifyRec(
    access_token,
    trackId,
    settings,
    audioFeatures,
    audioFeatureSettings, 
    isLoggedIn
  );

  console.log("data",data);

  if(data.tracks && Array.isArray(data.tracks)){
    console.log("in if data.tracks && Array.isArray(data.tracks)");
    const trackData = data.tracks;
    const tempTrackList:ITrack[] =[];

    let possibleTrack: ITrack|null = null;

    for(let i=0; i <trackData.length; i++){
      possibleTrack = isTrack(trackData[i]);
      if(possibleTrack != null && possibleTrack.id !== trackId){
        tempTrackList.push(possibleTrack);
      }
    }

    if (!isLoggedIn){
      tempTrackList.map(track => track.trackSaveState = TrackSaveState.CantSave);
    }
    else{
      const saveStatusData = await requestSaveStatus(access_token,tempTrackList);

      if(Array.isArray(saveStatusData) && saveStatusData.length === tempTrackList.length){
        for(let i=0; i < tempTrackList.length; i++){
          if (saveStatusData[i] === true){
            tempTrackList[i].trackSaveState = TrackSaveState.Saved;
          }
          else{
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
    console.log(tempTrackList);
    return tempTrackList;
  }

  console.log("returning empty array");
  return [];
}

interface RecOptionsSectionProps{
  checkedBoxes: string[],
  setCheckedBoxes: React.Dispatch<string[]>,
  audioFeatures: AudioFeatures,
  setIsSelectingOptions: React.Dispatch<boolean>
  setIsLoadingRecs: React.Dispatch<boolean>,
  audioSettings: AudioFeatureSettings,
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioFeatureSettings>>,
  submitRecsRequest?: (payload: string) => void,
}

export default function RecOptionsSection({
  checkedBoxes,
  setCheckedBoxes,
  audioFeatures,
  setIsSelectingOptions,
  setIsLoadingRecs,
  audioSettings,
  setAudioSettings,
  submitRecsRequest,
}:RecOptionsSectionProps){

  const submit = useSubmit();
  const submitRecs = submitRecsRequest ?? ((payload: string) => submit(payload, { method: "post", encType: "application/json" }));

 
  const audioFeatureNames: [keyof AudioFeatures, string][] = [
    ["valence", "Mood"],
    ["energy", "Energy"],
    ["danceability", "Danceability"],
    ["acousticness", "Acousticness"],
    ["tempo", "Tempo"],
    // ["key", "Key"],
    ["mode", "Mode"],
  ]

  enum SettingsType{
    PERCENTAGE_MIN_MAX,
    BOOL,
    OPTIONS
  }

const featureNameToSettingsTypeMap: Record<keyof AudioFeatures, SettingsType> = {
  "id": SettingsType.BOOL, //will be used to signal if track should be used in the recs request
  "acousticness": SettingsType.PERCENTAGE_MIN_MAX,
  "danceability": SettingsType.PERCENTAGE_MIN_MAX,
  "energy": SettingsType.PERCENTAGE_MIN_MAX,
  "valence": SettingsType.PERCENTAGE_MIN_MAX,
  "tempo": SettingsType.PERCENTAGE_MIN_MAX,
  "duration_ms": SettingsType.PERCENTAGE_MIN_MAX, //need to convert ms to seconds
  "key": SettingsType.OPTIONS,
  "mode": SettingsType.BOOL,
}

const audioFeatureReadableData = getAudioFeatureReadableData(audioFeatures);

  
  const isSettingPicked = (setting:string)=>{
    return checkedBoxes.includes(setting)
  }

  const handleToggleSettingBox = (setting:string)=>{

    let newSettings:string[] = [...checkedBoxes];
    
    if(isSettingPicked(setting)){
      newSettings = newSettings.filter((s)=> s != setting);
    }
    else{
      newSettings.push(setting)
    }

    //console.log(newSettings)
    setCheckedBoxes(newSettings)
  }

  
  return(
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-3 w-full p-3 sm:p-4">
          {audioFeatureNames.map((feature) => {
            const isChecked = isSettingPicked(feature[0]);
            return (
            <div
              key={feature[0]}
              className={"flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3 shadow-sm transition-colors " + (isChecked ? "border-green-500/70 bg-stone-800/70 shadow-green-500/5" : "border-stone-600/50 bg-stone-800/40")}
            >
              <div className="flex items-center gap-3 min-w-[12rem] shrink-0">
                <label htmlFor={feature[0]} className="relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center">
                  <input
                    type="checkbox"
                    id={feature[0]}
                    name={feature[0]}
                    checked={isChecked}
                    onChange={() => handleToggleSettingBox(feature[0])}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-md border-2 border-stone-500 bg-stone-800 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-green-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-stone-900 peer-checked:border-green-500 peer-checked:bg-green-600/90" />
                  <svg className="pointer-events-none relative h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 5l3 3 7-7" />
                  </svg>
                </label>
                <label
                  htmlFor={feature[0]}
                  className="cursor-pointer text-base font-medium text-stone-100 lg:text-lg flex items-center gap-2"
                >
                  <span>{feature[1]}</span>
                  <span className=" font-normal text-green-400/90">
                    {audioFeatureReadableData[feature[0]]}
                  </span>
                </label>
              </div>
              <div className="min-w-0 flex-1 basis-full sm:basis-0">
              {featureNameToSettingsTypeMap[feature[0]] === SettingsType.PERCENTAGE_MIN_MAX && (
                <FeatureSettingsBox
                  featureName={feature[0]}
                  audioFeatureSettings={audioSettings}
                  setAudioFeatureSetting={setAudioSettings}
                  featureSettingEnabled={checkedBoxes.includes(feature[0])}
                />
              )}
              {featureNameToSettingsTypeMap[feature[0]] === SettingsType.BOOL && (
                <BoolFeatureSettingsBox
                  featureName={feature[0]}
                  audioFeatureSettings={audioSettings}
                  setAudioFeatureSetting={setAudioSettings}
                  featureSettingEnabled={checkedBoxes.includes(feature[0])}
                />
              )}
              {featureNameToSettingsTypeMap[feature[0]] === SettingsType.OPTIONS && (
                <OptionFeatureSettBox
                  featureName={feature[0]}
                  audioFeatureSettings={audioSettings}
                  setAudioFeatureSetting={setAudioSettings}
                  featureSettingEnabled={checkedBoxes.includes(feature[0])}
                />
              )}
              </div>
            </div>
          );
          })}
          <div
            className={"flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3 shadow-sm transition-colors " + (isSettingPicked("popularity") ? "border-green-500/70 bg-stone-800/70 shadow-green-500/5" : "border-stone-600/50 bg-stone-800/40")}
          >
            <div className="flex items-center gap-3 min-w-[12rem] shrink-0">
              <label htmlFor="popularity" className="relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center">
                <input
                  type="checkbox"
                  id="popularity"
                  name="popularity"
                  checked={isSettingPicked("popularity")}
                  onChange={() => handleToggleSettingBox("popularity")}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-md border-2 border-stone-500 bg-stone-800 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-green-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-stone-900 peer-checked:border-green-500 peer-checked:bg-green-600/90" />
                <svg className="pointer-events-none relative h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 5l3 3 7-7" />
                </svg>
              </label>
              <label
                htmlFor="popularity"
                className="cursor-pointer text-base font-medium text-stone-100 lg:text-lg"
              >
                Popularity
              </label>
            </div>
            <div className="min-w-0 flex-1 basis-full sm:basis-0">
            <FeatureSettingsBox
              featureName="popularity"
              audioFeatureSettings={audioSettings}
              setAudioFeatureSetting={setAudioSettings}
              featureSettingEnabled={checkedBoxes.includes("popularity")}
            />
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-center justify-center p-3 sm:p-4 border-t border-zinc-800/50">
        <button
          type="button"
          onClick={() => {
            const submissionJSON = JSON.stringify({
              settings: checkedBoxes,
              audioFeatures,
              audioFeatureSettings: {
                acousticness: audioSettings.acousticness,
                danceability: audioSettings.danceability,
                energy: audioSettings.energy,
                valence: audioSettings.valence,
                tempo: audioSettings.tempo,
                key: audioSettings.key,
                mode: audioSettings.mode,
                duration_ms: audioSettings.duration_ms,
                popularity: audioSettings.popularity,
              } as AudioFeatureSettings,
            });
            submitRecs(submissionJSON);
            setIsSelectingOptions(false);
            setIsLoadingRecs(true);
          }}
          className="w-full max-w-xs rounded-xl bg-green-600 px-6 py-3 text-center text-lg font-semibold text-white shadow-md transition-colors hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-stone-900 disabled:bg-stone-600 disabled:text-stone-400"
        >
          Get New Tracks
        </button>
      </div>
    </div>
  );
}
