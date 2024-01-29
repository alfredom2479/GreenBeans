import { Dispatch, SetStateAction } from "react"

interface params  {
  setShowModal: Dispatch<SetStateAction<boolean>>,
  songPreviewUrl: string
}

export default function SongPreviewModal({setShowModal,songPreviewUrl}: params){


  return(
  <div className="z-10 fixed h-full w-full left-0 top-0 pt-48 bg-[rgba(0,0,0,.4)]"
    onClick={()=>{setShowModal(false)}}>
    <div className="bg-gray-50 m-auto w-10/12 flex justify-center">
        <iframe className="m-2" src={songPreviewUrl}/>
    </div>
  </div>
  )
}