import {Link} from "react-router-dom"
import { ITrack } from "../interfaces"


export default function TrackCard({id,name,artist,image,url}:ITrack){

  return(
    <>
    <div className="flex bg-stone-900 my-1 rounded-xl overflow-hidden">
        <div 
        className="basis-1/5">
        <img className="" src={image}/>
        </div>
        <div className="basis-3/5">
          <div className="text-purple-200 font-bold">{name}</div> 
          <div className="text-purple-300">{artist}</div>
        </div>
        {/* <div className="basis-1/5 bg-green-200 flex hover:bg-green-300"> */}
          <Link to={`/track/${id}`}
          className="bg-green-200 basis-1/5 p-1 text-center block items-center justify-center font-bold text-lg "
          >Recs
          </Link>

        {/* </div> */}
        {/* <div className="basis-1/5 bg-purple-200 flex hover:bg-purple-300"> */}
          <a
            href={url}
            className="bg-purple-300 basis-1/5 block p-1 text-center items-center justify-center font-bold text-lg"
            target="_blank"
          >Listen
          </a>

        {/* </div> */}
      </div> 
    </>
  )
}