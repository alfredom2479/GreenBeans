import { Dispatch, SetStateAction } from "react"
import { SongPreviewInfo } from "../interfaces"

interface params  {
  setShowModal: Dispatch<SetStateAction<boolean>>,
  songPreviewInfo: SongPreviewInfo
}

export default function SongPreviewModal({setShowModal,songPreviewInfo}: params){


  return(
  <div className="z-20 fixed h-full w-full left-0 top-0 flex justify-center items-center bg-[rgba(0,0,0,.4)]"
    onClick={()=>{setShowModal(false)}}>
    <div className=" bg-zinc-600 m-auto w-10/12  min-h-48 flex flex-col justify-center items-center ">
        <h3 className="text-xl font-semibold text-center">{songPreviewInfo.name}</h3>
        <h3 className="text-xl text-center">{songPreviewInfo.artist}</h3>
        <iframe className="m-2 max-w-[90%] " src={songPreviewInfo.url}/>
    </div>
  </div>
  )
}