import { AudioFeatures } from "../../interfaces";

export default function BoolFeatureSettingsBox({
    featureName, 
    audioFeatureSetting, 
    setAudioFeatureSetting
}:{
    featureName:keyof AudioFeatures, 
    audioFeatureSetting:boolean, 
    setAudioFeatureSetting:React.Dispatch<React.SetStateAction<boolean>>
}){

    const yesLabel = featureName === "mode" ? "Major" : "Yes";
    const noLabel = featureName === "mode" ? "Minor" : "No";

    return (
        <div className="flex gap-4">
            <div>
                <input 
                    type="radio" 
                    id={`${featureName}-yes`}
                    name={featureName} 
                    checked={audioFeatureSetting} 
                    onChange={() => setAudioFeatureSetting(true)}
                    />
                <label className="text-2xl text-green-50" htmlFor={`${featureName}-yes`}> {yesLabel}</label>
            </div>
            <div>
                <input 
                    type="radio" 
                    id={`${featureName}-no`}
                    name={featureName}
                    checked={!audioFeatureSetting}
                    onChange={() => setAudioFeatureSetting(false)} 
                    />
                <label className="text-2xl text-green-50" htmlFor={`${featureName}-no`}> {noLabel}</label>
            </div>
        </div>
    )
}