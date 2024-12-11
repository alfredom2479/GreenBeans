import { ITrack, SongPreviewInfo, } from "../../interfaces"
import TrackCard from "../TrackCard"

interface CompParams{
  listTracks: ITrack[],
  handleOnClick: (songPreviewInfo:SongPreviewInfo|undefined)=>void,
  isLoadingRecs: boolean
}

export default function RecList({listTracks,handleOnClick,isLoadingRecs}:CompParams){

  //ad-hoc way of checking if user is logged in lol
  const refreshToken:string|null = localStorage.getItem("refresh_token");

  return (
    <div className="h-full overflow-y-scroll">
      {isLoadingRecs  ? <p className="text-white">Loading...</p> :
        <ul>
          {listTracks.map((track)=>{
            return (
              <li key={track.id}>
                <TrackCard
                  hideSaveButton={refreshToken === null || refreshToken.length < 1}
                  track={track}
                  popModal={handleOnClick}
                />
              </li>
            )
          })}
        </ul>
      }
    </div>
  )
}