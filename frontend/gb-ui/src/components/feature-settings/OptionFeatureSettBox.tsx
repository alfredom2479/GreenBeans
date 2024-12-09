import { AudioFeatures } from "../../interfaces";

export default function OptionFeatureSettBox({
    featureName, 
    audioFeatureSetting, 
    setAudioFeatureSetting
}:{
    featureName:keyof AudioFeatures, 
    audioFeatureSetting:number, 
    setAudioFeatureSetting:React.Dispatch<React.SetStateAction<number>>
}){

    const options: [number, string][] = featureName === 
    "time_signature" ? [[3,"3/4"], [4,"4/4"], [5,"5/4"], [6,"6/4"], [7,"7/4"]] : 
    [[0,"C"], [1,"C#"], [2,"D"], [3,"D#"], [4,"E"], [5,"F"], [6,"F#"], [7,"G"], [8,"G#"], [9,"A"], [10,"A#"], [11,"B"]];

    return(
        <div className="pl-4 flex flex-wrap gap-4 w-full">
            {options.map((option)=>(
                <div key={option[0]} className="flex items-center">
                    <input 
                        type="radio" 
                        id={`${featureName}-${option[0]}`}
                        name={featureName}
                        checked={audioFeatureSetting === option[0]}
                        onChange={() => setAudioFeatureSetting(option[0])}
                    />
                    <label className="text-2xl text-green-50" htmlFor={`${featureName}-${option[0]}`}> {option[1]}</label>
                </div>
            ))}
        </div>
    )
}