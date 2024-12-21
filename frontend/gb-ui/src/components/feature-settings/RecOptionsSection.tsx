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
    //console.log(tempTrackList);
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
  audioSettings: AudioFeatureSettings,
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioFeatureSettings>>,
}

export default function RecOptionsSection({
  checkedBoxes,
  setCheckedBoxes, 
  audioFeatures, 
  setIsSelectingOptions, 
  setIsLoadingRecs,
  audioSettings,
  setAudioSettings,
  
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
    <>
    <div className="flex flex-col justify-between max-w-full h-full py-2 overflow-y-scroll">
      <div className="flex justify-items-center">
      <div className="w-full">

      {audioFeatureNames.map((feature)=>{
        //console.log(audioFeatures[feature[0]])
        return (
          <div key={feature[0]} className="flex m-2 lg:m-4 h-16 items-center">
            <div className="flex items-center w-56 h-16">
            <input 
              className="w-5 h-5 cursor-pointer accent-green-800 rounded-xl border-2 border-green-500 focus:ring-gray-500 focus:ring-2"
              onClick={()=>handleToggleSettingBox(feature[0])} 
              defaultChecked={isSettingPicked(feature[0])} 
              name={feature[0]} 
              id={feature[0]} 
              type="checkbox">
            </input>
            <label className="text-lg h-16  lg:text-xl text-green-50 px-2" htmlFor={feature[0]}> 
              {feature[1]}  <br/> <b className="text-green-600">{audioFeatureReadableData[feature[0]]}</b>
            </label>
            </div>
            {((featureNameToSettingsTypeMap[feature[0]] === SettingsType.PERCENTAGE_MIN_MAX &&
              <FeatureSettingsBox 
                featureName={feature[0]} 
                audioFeatureSettings={audioSettings}
                setAudioFeatureSetting={setAudioSettings}
                featureSettingEnabled={checkedBoxes.includes(feature[0])}
              />
            ) ||
            (featureNameToSettingsTypeMap[feature[0]] === SettingsType.BOOL &&
              <BoolFeatureSettingsBox
                featureName={feature[0]}
                audioFeatureSettings={audioSettings}
                setAudioFeatureSetting={setAudioSettings}
                featureSettingEnabled={checkedBoxes.includes(feature[0])}
              />
            ) ||
            (featureNameToSettingsTypeMap[feature[0]] === SettingsType.OPTIONS &&
              <OptionFeatureSettBox
                featureName={feature[0]}
                audioFeatureSettings={audioSettings}
                setAudioFeatureSetting={setAudioSettings}
                featureSettingEnabled={checkedBoxes.includes(feature[0])}
              />
            ))}
            <br/>
          </div>
        )
      })}
      <div key="popularity" className="flex m-2 lg:m-4 h-16 items-center">
        <div className="flex items-center w-56 h-16">
        <input 
          onClick={()=>handleToggleSettingBox("popularity")} 
          defaultChecked={isSettingPicked("popularity")} 
          name="popularity" 
          id="popularity" 
          type="checkbox"
          className="w-5 h-5 cursor-pointer accent-green-800 rounded-xl border-2 border-green-500 focus:ring-gray-500 focus:ring-2"
          >
        </input>
        <label className="text-lg lg:text-xl text-green-50 pl-2" htmlFor="popularity"> 
          Popularity
        </label>
        </div>
        { <FeatureSettingsBox 
            featureName="popularity" 
            audioFeatureSettings={audioSettings}
            setAudioFeatureSetting={setAudioSettings}
            featureSettingEnabled={checkedBoxes.includes("popularity")}
          />
        }
      </div>
      
      </div>
      </div>
      
    </div>
      <div className="flex flex-col items-center">
      <button 
        disabled={audioSettings.acousticness > 1 ||
          audioSettings.danceability > 1 ||
          audioSettings.energy > 1 ||
          audioSettings.valence > 1 ||
          audioSettings.tempo > 200 ||
          audioSettings.duration_ms > 600000}
        onClick={()=>{
          const submissionJSON = JSON.stringify(
            {settings:checkedBoxes,
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
                popularity: audioSettings.popularity
              } as AudioFeatureSettings
            });
          submit(
            submissionJSON,
            { method: "post", encType: "application/json" }
          );
          setIsSelectingOptions(false)
          setIsLoadingRecs(true)
          
        }}
        className=" max-h-[10vh] mb-4 bg-green-50 hover:bg-green-200 text-stone-900 text-lg lg:text-xl rounded-xl font-bold p-2 w-1/2 text-center flex justify-center items-center disabled:bg-gray-400 disabled:text-gray-600"
        >Get New Tracks
      </button>
      
      </div>
      </>
  )
}
