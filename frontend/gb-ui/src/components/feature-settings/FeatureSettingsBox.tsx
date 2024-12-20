import { AudioFeatures, AudioFeatureSettings } from "../../interfaces";
import { formatSecondsToMinutesAndSeconds } from "../../utils";

export default function FeatureSettingsBox({
  featureName, 
  audioFeatureSettings, 
  setAudioFeatureSetting,
}:{
  featureName:keyof AudioFeatures, 
  audioFeatureSettings:AudioFeatureSettings, 
  setAudioFeatureSetting:React.Dispatch<React.SetStateAction<AudioFeatureSettings>>,
}){

  function formatDisplayValue(value:number):string{
    if(featureName === "tempo"){
      return Math.round(value).toString() + "bpm";
    }
    return featureName === "duration_ms" ? formatSecondsToMinutesAndSeconds(value/1000) 
      : (Math.round(value * 100)).toString() + "%";
  }

  const step = featureName === "tempo" || featureName === "duration_ms" ? 1 : 0.01;
  const max = featureName === "tempo" ? 200 : featureName === "duration_ms" ? 600000 : 1;


  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAudioFeatureSetting(prev => ({
      ...prev,
      [featureName]: Number(e.target.value)
    }));
  }

  //console.log(featureName, audioFeatureSettings[featureName]);
  

  return (
    <div className="p-4 w-full">
        <div className="flex flex-col gap-4">
         <div className="flex gap-4 max-w-2xl ">
          <div className="flex flex-1 flex-col">
            <label htmlFor={`${featureName}-preference`} className=" text-white"> 
              {formatDisplayValue(audioFeatureSettings[featureName] as number)}
            </label>
            <input type="range" min="0" max={max} step={step} 
              className="w-full h-2 appearance-none cursor-pointer rounded-lg bg-gray-700" 
              id={`${featureName}-preference`} 
              value={audioFeatureSettings[featureName] as number} 
              onChange={(e) => handleValueChange(e)} />
          </div>

{/*
          <div className="flex flex-1 flex-col">
            <label htmlFor={`${featureName}-max`} className=" text-white">Max: {formatDisplayValue(audioFeatureSetting.max)}</label>
            <input type="range" min="0" max={max} step={step} 
              className="w-full h-2 appearance-none cursor-pointer rounded-lg bg-gray-700" 
              id={`${featureName}-max`} 
              value={audioFeatureSetting.max} 
              onChange={(e) => handleValueChange(e, false)} />
          </div>
          */}
          </div>

          {/*
          {audioFeatureSetting.min >= audioFeatureSetting.max && <p className="flex text-red-500">Minimum value must be less than maximum value</p>}
          */}
        </div>
      
    </div>
  )
  }
