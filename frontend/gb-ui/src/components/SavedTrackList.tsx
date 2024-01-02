import { ITrack } from "../interfaces";
import TrackCard from "./TrackCard";



export default function SavedTrackList(tracksList:ITrack[]){

  return(
    <div className="basis-3/4 overflow-y-scroll">
      <ul>
        {tracksList.map((track)=>{
          return (
            <li key={track.id}>
              <TrackCard
                id={track.id}
                name={track.name}
                artist={track.artist}
                image={track.image}
                url={track.url}
                />
            </li>
          )
        })}
      </ul>

    </div>
  )

}