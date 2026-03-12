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
        <div className="flex flex-1 flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-600/50 bg-stone-800/50 px-4 py-2.5 transition-colors has-[:checked]:border-green-500/70 has-[:checked]:bg-green-500/10 has-[:disabled]:opacity-50">
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
                    className="h-4 w-4 border-2 border-stone-500 bg-stone-800 text-green-600 focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-stone-900"
                />
                <span className="text-sm font-medium text-stone-200">{yesLabel}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-stone-600/50 bg-stone-800/50 px-4 py-2.5 transition-colors has-[:checked]:border-green-500/70 has-[:checked]:bg-green-500/10 has-[:disabled]:opacity-50">
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
                    className="h-4 w-4 border-2 border-stone-500 bg-stone-800 text-green-600 focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-stone-900"
                />
                <span className="text-sm font-medium text-stone-200">{noLabel}</span>
            </label>
        </div>
    )
}