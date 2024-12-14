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
    acousticness: {min: 0, max: 1},
    danceability: {min: 0, max: 1},
    energy: {min: 0, max: 1},
    valence: {min: 0, max: 1},
    tempo: {min: 0, max: 200},
    duration_ms: {min: 0, max: 600},
    key: 0,
    mode: false
  };

  const requestJson = await request.json();
  audioFeatures = requestJson.audioFeatures;
  settings = requestJson.settings;
  audioFeatureSettings = requestJson.audioFeatureSettings;

  console.log(audioFeatureSettings);

  const data = await requestSpotifyRec(
    access_token,
    trackId,
    settings,
    audioFeatures,
    audioFeatureSettings, 
    isLoggedIn
  );

  if(data.tracks && Array.isArray(data.tracks)){

    const trackData = data.tracks;
    const tempTrackList:ITrack[] =[];

    let possibleTrack: ITrack|null = null;

    for(let i=0; i <trackData.length; i++){
      possibleTrack = isTrack(trackData[i]);
      if(possibleTrack != null){
        tempTrackList.push(possibleTrack);
      }
    }

    if (!isLoggedIn){
      for(let i=0; i < tempTrackList.length; i++){
        tempTrackList[i].trackSaveState = TrackSaveState.CantSave;
      }
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

  return [];
}

interface RecOptionsSectionProps{
  checkedBoxes: string[],
  setCheckedBoxes: React.Dispatch<string[]>,
  audioFeatures: AudioFeatures,
  setIsSelectingOptions: React.Dispatch<boolean>
  setIsLoadingRecs: React.Dispatch<boolean>,
  acousticnessSettings: {min:number, max:number},
  setAcousticnessSettings: React.Dispatch<React.SetStateAction<{min:number, max:number}>>,
  danceabilitySettings: {min:number, max:number},
  setDanceabilitySettings: React.Dispatch<React.SetStateAction<{min:number, max:number}>>,
  energySettings: {min:number, max:number},
  setEnergySettings: React.Dispatch<React.SetStateAction<{min:number, max:number}>>,
  valenceSettings: {min:number, max:number},
  setValenceSettings: React.Dispatch<React.SetStateAction<{min:number, max:number}>>,
  tempoSettings: {min:number, max:number},
  setTempoSettings: React.Dispatch<React.SetStateAction<{min:number, max:number}>>,
  keySettings: number,
  setKeySettings: React.Dispatch<React.SetStateAction<number>>,
  modeSettings: boolean,
  setModeSettings: React.Dispatch<React.SetStateAction<boolean>>,
  durationSettings: {min:number, max:number},
  setDurationSettings: React.Dispatch<React.SetStateAction<{min:number, max:number}>>,
}

export default function RecOptionsSection({
  checkedBoxes,
  setCheckedBoxes, 
  audioFeatures, 
  setIsSelectingOptions, 
  setIsLoadingRecs,
  acousticnessSettings,
  setAcousticnessSettings,
  danceabilitySettings,
  setDanceabilitySettings,
  energySettings,
  setEnergySettings,
  valenceSettings,
  setValenceSettings,
  tempoSettings,
  setTempoSettings,
  keySettings,
  setKeySettings,
  modeSettings,
  setModeSettings,
  durationSettings,
  setDurationSettings,
}:RecOptionsSectionProps){

  const submit = useSubmit();

 


  const audioFeatureNames: [keyof AudioFeatures, string][] = [
    ["valence", "Mood"],
    ["energy", "Energy"],
    ["danceability", "Danceability"],
    ["acousticness", "Acousticness"],
    ["tempo", "Tempo"],
    ["key", "Key"],
    ["mode", "Mode"],
    ["duration_ms", "Duration"]
    //["time_signature", "Time Signature"],
    //["instrumentalness", "Instrumentalness"], instrumentalness only returns really low values
    //["liveness", "Played Live?"],
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


const getSettingsForFeature = (featureName: keyof AudioFeatures) => {
  switch(featureName) {
    case "acousticness":
      return {
        audioFeatureSetting: acousticnessSettings,
        setAudioFeatureSetting: setAcousticnessSettings
      };
    case "danceability":
      return {
        audioFeatureSetting: danceabilitySettings,
        setAudioFeatureSetting: setDanceabilitySettings
      };
    case "energy":
      return {
        audioFeatureSetting: energySettings,
        setAudioFeatureSetting: setEnergySettings
      };
    case "valence":
      return {
        audioFeatureSetting: valenceSettings,
        setAudioFeatureSetting: setValenceSettings
      };
    case "tempo":
      return {
        audioFeatureSetting: tempoSettings,
        setAudioFeatureSetting: setTempoSettings
      };
    case "key":
      return {
        audioFeatureSetting: keySettings,
        setAudioFeatureSetting: setKeySettings
      };
    case "mode":
      return {
        audioFeatureSetting: modeSettings,
        setAudioFeatureSetting: setModeSettings
      };
    case "duration_ms":
      return {
        audioFeatureSetting: durationSettings,
        setAudioFeatureSetting: setDurationSettings
      };
    default:
      return {
          audioFeatureSetting: {min: 0, max: 1},
          setAudioFeatureSetting: () => {}
        };
    }
  }

  
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

    setCheckedBoxes(newSettings)
  }
  
  return(
    <>
    <div className="flex flex-col justify-between max-w-full h-full py-2 overflow-y-scroll">
      <div className="flex justify-items-center">
      <div className="w-full">

      {audioFeatureNames.map((feature)=>{
        //console.log(audioFeatures[feature[0]])
        return (
          <div key={feature[0]} className="m-2">
            <input 
              onClick={()=>handleToggleSettingBox(feature[0])} 
              defaultChecked={isSettingPicked(feature[0])} 
              name={feature[0]} 
              id={feature[0]} 
              type="checkbox">
            </input>
            <label className="text-2xl text-green-50 pl-2" htmlFor={feature[0]}> 
              {feature[1]} : <b className="text-green-600">{audioFeatureReadableData[feature[0]]}</b>
            </label>
            {checkedBoxes.includes(feature[0]) && 
            ((featureNameToSettingsTypeMap[feature[0]] === SettingsType.PERCENTAGE_MIN_MAX &&
              <FeatureSettingsBox 
                featureName={feature[0]} 
                audioFeatureSetting={getSettingsForFeature(feature[0]).audioFeatureSetting as {min: number, max: number}}
                setAudioFeatureSetting={getSettingsForFeature(feature[0]).setAudioFeatureSetting as React.Dispatch<React.SetStateAction<{min: number, max: number}>>}
              />
            ) ||
            (featureNameToSettingsTypeMap[feature[0]] === SettingsType.BOOL &&
              <BoolFeatureSettingsBox
                featureName={feature[0]}
                audioFeatureSetting={getSettingsForFeature(feature[0]).audioFeatureSetting as boolean}
                setAudioFeatureSetting={getSettingsForFeature(feature[0]).setAudioFeatureSetting as React.Dispatch<React.SetStateAction<boolean>>}/>
            ) ||
            (featureNameToSettingsTypeMap[feature[0]] === SettingsType.OPTIONS &&
              <OptionFeatureSettBox
                featureName={feature[0]}
                audioFeatureSetting={getSettingsForFeature(feature[0]).audioFeatureSetting as number}
                setAudioFeatureSetting={getSettingsForFeature(feature[0]).setAudioFeatureSetting as React.Dispatch<React.SetStateAction<number>>}/>
            ))}
            <br/>
          </div>
        )
      })}
      
      </div>
      </div>
      
    </div>
      <div className="flex flex-col items-center">
      <button 
        disabled={acousticnessSettings.min >= acousticnessSettings.max ||
          danceabilitySettings.min >= danceabilitySettings.max ||
          energySettings.min >= energySettings.max ||
          valenceSettings.min >= valenceSettings.max ||
          tempoSettings.min >= tempoSettings.max ||
          durationSettings.min >= durationSettings.max}
        onClick={()=>{
          const submissionJSON = JSON.stringify(
            {settings:checkedBoxes,
              audioFeatures,
              audioFeatureSettings: {
                acousticness: acousticnessSettings,
                danceability: danceabilitySettings,
                energy: energySettings,
                valence: valenceSettings,
                tempo: tempoSettings,
                key: keySettings,
                mode: modeSettings,
                duration_ms: durationSettings,
              } as AudioFeatureSettings
            });
          submit(
            submissionJSON,
            { method: "post", encType: "application/json" }
          );
          setIsSelectingOptions(false)
          setIsLoadingRecs(true)
          
        }}
        className=" max-h-[10vh] mb-4 bg-green-50 hover:bg-green-200 text-stone-900 text-xl rounded-xl font-bold p-2 w-1/2 text-center flex justify-center items-center disabled:bg-gray-400 disabled:text-gray-600"
        >get tracks
      </button>
      
      </div>
      </>
  )
}
