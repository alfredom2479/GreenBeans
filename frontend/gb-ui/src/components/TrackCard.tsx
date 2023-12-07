import {Link} from "react-router-dom"
import { ITrack } from "../interfaces"


export default function TrackCard({id,name,artist,image}:ITrack){

  console.log(id);
  return(
    <>
    <div className="flex bg-stone-900 my-1 rounded-xl overflow-hidden">
        <div className="flex-3">
        <img className="h-20" src={image}/>
        </div>
        <div className="flex-1">
          <div className="text-purple-200 font-bold">{name}</div> 
          <div className="text-purple-300">{artist}</div>
        </div>
        <div>
          <Link to={`/track/${id}`}> 
            View
          </Link>
        </div>
      </div> 
    </>
  )
}