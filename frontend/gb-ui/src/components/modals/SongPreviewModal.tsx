import { Dispatch, SetStateAction, useRef } from "react"
import { SongPreviewInfo } from "../../interfaces"

interface params  {
  setShowModal: Dispatch<SetStateAction<boolean>>,
  songPreviewInfo: SongPreviewInfo
}

export default function SongPreviewModal({setShowModal,songPreviewInfo}: params){

  const audioRef = useRef<HTMLAudioElement>(null);

  //console.log(songPreviewInfo);

  return(
    <div className="z-20 fixed h-full w-full left-0 top-0 flex justify-center items-center bg-[rgba(0,0,0,.4)]"
      onClick={()=>{setShowModal(false)}}>
        <div className=" bg-zinc-400 m-auto w-10/12 max-w-6xl max-h-screen min-h-48 flex flex-col justify-center items-center rounded-lg " onClick={(e)=>{e.stopPropagation()}}>
          <h3 className="text-xl font-semibold text-center truncate max-w-full px-2">{songPreviewInfo.name}</h3>
          <h3 className="text-xl text-center truncate max-w-full px-2">{songPreviewInfo.artist}</h3>
          {/* <iframe className="m-2 max-w-[90%] " src={songPreviewInfo.url}/> */}

          <img src={songPreviewInfo.image} alt="song image" className="w-full max-w-md max-h-[50vh] rounded-lg object-cover"/>

          <audio 
            ref={audioRef}
            src={songPreviewInfo.url} 
            controls
            className="w-full max-w-md"
          />
        </div>
    </div>
  )
}