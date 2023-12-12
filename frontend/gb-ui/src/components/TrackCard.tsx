import {Link} from "react-router-dom"
import { ITrack } from "../interfaces"


export default function TrackCard({id,name,artist,image}:ITrack){

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
        <div className="basis-1/5 bg-green-200 flex hover:bg-green-300"
        >
          <Link to={`/track/${id}`}
          className="w- h-full flex-1 p-1 text-center flex items-center justify-center font-bold text-lg "
          > 
            Get Recs
          </Link>
        </div>
      </div> 
    </>
  )
}