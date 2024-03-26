import { ITrack } from "../interfaces"
import TrackCard from "./TrackCard"

interface CompParams{
  listTracks: ITrack[]
}

export default function RecList({listTracks}:CompParams){
  
  return (
    <div className="overflow-y-scroll">
      <ul>
        {
          listTracks.map((track)=>{
            return (
              <TrackCard
                id={track.id}
                name={track.name}
                artist={track.artist}
            )
          })
        }
      </ul>
    </div>
  )
}