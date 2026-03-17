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

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {isLoadingRecs  ? (
        <div className="h-48 sm:h-56 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-zinc-500 text-sm sm:text-base">Loading…</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800/80">
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
      )}
    </div>
  )
}