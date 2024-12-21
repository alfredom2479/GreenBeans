import { AudioFeatures, AudioFeatureSettings } from "../../interfaces";

export default function BoolFeatureSettingsBox({
    featureName, 
    audioFeatureSettings, 
    setAudioFeatureSetting,
    featureSettingEnabled
}:{
    featureName:keyof AudioFeatures, 
    audioFeatureSettings:AudioFeatureSettings, 
    setAudioFeatureSetting:React.Dispatch<React.SetStateAction<AudioFeatureSettings>>,
    featureSettingEnabled:boolean
}){

    const yesLabel = featureName === "mode" ? "Major" : "Yes";
    const noLabel = featureName === "mode" ? "Minor" : "No";

    return (
        <div className=" flex gap-4 w-full">
            <div className="flex items-center">
                <input 
                    type="radio" 
                    id={`${featureName}-yes`}
                    name={featureName} 
                    disabled={!featureSettingEnabled}
                    checked={audioFeatureSettings[featureName] === true} 
                    onChange={() => setAudioFeatureSetting(prev => ({
                        ...prev,
                        [featureName]: true
                    }))}
                    />
                <label className="text-xl text-green-50" htmlFor={`${featureName}-yes`}> {yesLabel}</label>
            </div>
            <div className="flex items-center">
                <input 
                    type="radio" 
                    id={`${featureName}-no`}
                    name={featureName}
                    disabled={!featureSettingEnabled}
                    checked={audioFeatureSettings[featureName] === false}
                    onChange={() => setAudioFeatureSetting(prev => ({
                        ...prev,
                        [featureName]: false
                    }))} 
                    />
                <label className="text-xl text-green-50" htmlFor={`${featureName}-no`}> {noLabel}</label>
            </div>
        </div>
    )
}