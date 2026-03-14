import { ITrack, SongPreviewInfo, } from "../../interfaces"
import TrackCard from "../TrackCard"

interface CompParams{
  listTracks: ITrack[],
  handleOnClick: (songPreviewInfo:SongPreviewInfo|undefined, index?: number, trackList?: ITrack[])=>void,
  isLoadingRecs: boolean
}

export default function RecList({listTracks,handleOnClick,isLoadingRecs}:CompParams){

  //ad-hoc way of checking if user is logged in lol
  const refreshToken:string|null = localStorage.getItem("refresh_token");
  console.log("isLoadingRecs",isLoadingRecs);
  console.log(listTracks);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {isLoadingRecs  ? <p className="text-white">Loading...</p> :
        <ul>
          {listTracks.map((track, index)=>{
            return (
              <li key={track.id}>
                <TrackCard
                  hideSaveButton={refreshToken === null || refreshToken.length < 1}
                  track={track}
                  popModal={(info) => handleOnClick(info, index, listTracks)}
                />
              </li>
            )
          })}
        </ul>
      }
    </div>
  )
}