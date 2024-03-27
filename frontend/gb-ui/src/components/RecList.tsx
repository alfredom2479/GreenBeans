import { ITrack, SongPreviewInfo, TrackSaveState } from "../interfaces"
import TrackCard from "./TrackCard"

interface CompParams{
  listTracks: ITrack[],
  handleOnClick: (songPreviewInfo:SongPreviewInfo|undefined)=>void
}

export default function RecList({listTracks, handleOnClick}:CompParams){

  
  
  return (
    <div className="overflow-y-scroll">
      <ul>
        {
          listTracks.map((track)=>{
            return (
              <li key={track.id}>
              <TrackCard
                id={track.id}
                name={track.name}
                artist={track.artist}
                image={track.image}
                url={track.url}
                popModal={handleOnClick}
                trackSaveState={TrackSaveState.Saveable}
              />
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}