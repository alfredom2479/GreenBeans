import { AudioFeatures, AudioFeatureSettings } from "../../interfaces";

export default function BoolFeatureSettingsBox({
    featureName, 
    audioFeatureSettings, 
    setAudioFeatureSetting
}:{
    featureName:keyof AudioFeatures, 
    audioFeatureSettings:AudioFeatureSettings, 
    setAudioFeatureSetting:React.Dispatch<React.SetStateAction<AudioFeatureSettings>>
}){

    const yesLabel = featureName === "mode" ? "Major" : "Yes";
    const noLabel = featureName === "mode" ? "Minor" : "No";

    return (
        <div className="pl-4 flex gap-4">
            <div>
                <input 
                    type="radio" 
                    id={`${featureName}-yes`}
                    name={featureName} 
                    checked={audioFeatureSettings[featureName] === true} 
                    onChange={() => setAudioFeatureSetting(prev => ({
                        ...prev,
                        [featureName]: true
                    }))}
                    />
                <label className="text-2xl text-green-50" htmlFor={`${featureName}-yes`}> {yesLabel}</label>
            </div>
            <div>
                <input 
                    type="radio" 
                    id={`${featureName}-no`}
                    name={featureName}
                    checked={audioFeatureSettings[featureName] === false}
                    onChange={() => setAudioFeatureSetting(prev => ({
                        ...prev,
                        [featureName]: false
                    }))} 
                    />
                <label className="text-2xl text-green-50" htmlFor={`${featureName}-no`}> {noLabel}</label>
            </div>
        </div>
    )
}