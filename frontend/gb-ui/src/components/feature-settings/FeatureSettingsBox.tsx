import { AudioFeatures, AudioFeatureSettings } from "../../interfaces";
//import { formatSecondsToMinutesAndSeconds } from "../../utils";

export default function FeatureSettingsBox({
  featureName, 
  audioFeatureSettings, 
  setAudioFeatureSetting,
  featureSettingEnabled
}:{
  featureName:keyof AudioFeatures | "popularity", 
  audioFeatureSettings:AudioFeatureSettings, 
  setAudioFeatureSetting:React.Dispatch<React.SetStateAction<AudioFeatureSettings>>,
  featureSettingEnabled:boolean
}){

  function formatDisplayValue(value:number):string{
    if(featureName === "tempo"){
      return Math.round(value).toString() + "bpm";
    }
    if(featureName === "popularity"){
      return value.toString() + "%";
    }
    return (Math.round(value * 100)).toString() + "%";
  }

  const step = featureName === "tempo" || featureName === "popularity" ? 1 : 0.01;
  const max = featureName === "tempo" ? 200 : featureName === "popularity" ? 100 : 1;


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
          <div className="flex flex-1 items-center">
            <label htmlFor={`${featureName}-preference`} className=" text-white  lg:pr-6 flex-1 "> 
              {formatDisplayValue(audioFeatureSettings[featureName] as number)}
            </label>
            <input type="range" min="0" max={max} step={step} 
              className="w-full h-2 appearance-none cursor-pointer rounded-lg bg-gray-700 flex-[2_2_0%] disabled:bg-stone-800" 
              disabled={!featureSettingEnabled}
              id={`${featureName}-preference`} 
              value={audioFeatureSettings[featureName] as number} 
              onChange={(e) => handleValueChange(e)} />
          </div>

          </div>

        </div>
      
    </div>
  )
}
