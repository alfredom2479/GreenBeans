import { AudioFeatures } from "../../interfaces";


export default function FeatureSettingsBox({
  featureName, 
  audioFeatureSetting, 
  setAudioFeatureSetting
}:{
  featureName:keyof AudioFeatures, 
  audioFeatureSetting:{min:number, max:number}, 
  setAudioFeatureSetting:React.Dispatch<React.SetStateAction<{min:number, max:number}>>,
}){


  const step = featureName === "tempo" || featureName === "duration_ms" ? 1 : 0.01;
  const max = featureName === "tempo" ? 200 : featureName === "duration_ms" ? 600 : 1;


  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>, isMin: boolean) {
    setAudioFeatureSetting({...audioFeatureSetting, [isMin ? "min" : "max"]: Number(e.target.value)});
  }
  

  return (
    <div className="p-4">
        <div className="flex flex-col gap-4">
         <div className="flex gap-4">
          <div className="flex flex-col">
            <label htmlFor={`${featureName}-min`} className=" text-white">Minimum: {audioFeatureSetting.min}</label>
            <input type="range" min="0" max={max} step={step} className="w-full" id={`${featureName}-min`} 
              value={audioFeatureSetting.min} onChange={(e) => handleValueChange(e, true)} />
          </div>

          <div className="flex flex-col">
            <label htmlFor={`${featureName}-max`} className=" text-white">Maximum: {audioFeatureSetting.max}</label>
            <input type="range" min="0" max={max} step={step} className="w-full" id={`${featureName}-max`} 
              value={audioFeatureSetting.max} onChange={(e) => handleValueChange(e, false)} />
          </div>
          </div>

          {audioFeatureSetting.min > audioFeatureSetting.max && <p className="flex text-red-500">Minimum value must be less than maximum value</p>}
        </div>
      
    </div>
  )
}