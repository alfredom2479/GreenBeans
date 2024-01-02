import {Link} from "react-router-dom"
import { ITrack } from "../interfaces"
import { saveSpotifyTrack } from "../api"


export default function TrackCard({id,name,artist,image,url}:ITrack){

  async function handleOnClick(){
    console.log("handleing save...")
    try{
    const responseData = await saveSpotifyTrack(id);
    if(!responseData){
      console.log("Button says the put request was poopoo");
    }
    else{
      console.log(`'${name}' saved`);
    }
  }catch(err){
    console.log("save track onClick error occured");
    console.log(err);
  }
  }

  return(
    <>
    <div className="flex bg-stone-900 my-1 rounded-xl overflow-hidden">
        <div 
        className="basis-1/6">
        <img className="" src={image}/>
        </div>
        <div className="basis-3/5">
          <div className="text-purple-200 font-bold">{name}</div> 
          <div className="text-purple-300">{artist}</div>
        </div>
        {/* <div className="basis-1/5 bg-green-200 flex hover:bg-green-300"> */}
          <Link to={`/track/${id}`}
          className="bg-purple-950 text-white basis-1/6 p-1 text-center flex items-center justify-center font-bold text-lg "
          >Recs
          </Link>

        {/* </div> */}
        {/* <div className="basis-1/5 bg-purple-200 flex hover:bg-purple-300"> */}
          <a
            href={url}
            className="bg-green-900 text-white basis-1/6 flex p-1 text-center items-center justify-center font-bold text-lg"
            target="_blank"
          >Listen
          </a>
          {/** Maybe directly call the api function from here 
           * since u don't need to know what it returns... bc it doesn't return anything.
           * I guess print something on screen on if the request was succesful or not.
           */}
          <button
            className="bg-green-950 text-white basis-1/6 p-1 text-center block items-center justify-center font-bold text-lg" 
            onClick={()=>handleOnClick()}
          >Save
            
          </button>

        {/* </div> */}
      </div> 
    </>
  )
}