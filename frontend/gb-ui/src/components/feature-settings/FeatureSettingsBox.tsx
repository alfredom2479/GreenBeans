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
    <div className="flex flex-[2] grow min-w-0 max-w-2xl items-center gap-4 py-1">
      <span
        id={`${featureName}-value`}
        className="min-w-[4.5rem] text-right text-sm font-medium tabular-nums text-stone-300"
        aria-live="polite"
      >
        {formatDisplayValue(audioFeatureSettings[featureName] as number)}
      </span>
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        id={`${featureName}-preference`}
        value={audioFeatureSettings[featureName] as number}
        onChange={handleValueChange}
        disabled={!featureSettingEnabled}
        aria-labelledby={`${featureName}-value`}
        className="h-2 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-stone-600 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:hover:bg-green-400 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-green-500"
      />
    </div>
  )
}
