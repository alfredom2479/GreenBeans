
import { ITrack } from "../interfaces"

/*interface ITrackDetails{
  id: string
  trackTitle:string

}*/

export default function TrackCard({id,name,artist,image}:ITrack){

  console.log(id);
  return(
    <>
    <div className="flex bg-green-200 my-4 rounded-xl">
        <div className="flex-3">
        <img src={image}/>
        </div>
        <div className="flex-1">
          <div >{name}</div> 
          <div>{artist}</div>
        </div>
      </div> 
    </>
  )
}