import {Link} from "react-router-dom"
import { ITrack } from "../interfaces"
import { saveSpotifyTrack } from "../api"

function handleDefaultModalError(prevUrl: string){
  console.log("no modal was given to handle preview: "+ prevUrl);
}

export default function TrackCard({id,name,artist,image,url,isRec=false,popModal=handleDefaultModalError}:ITrack){

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
    <div className="flex bg-stone-900 my-1 rounded-xl h-14">
        <div 
        className="w-fit  shrink-0 grow-0">
        <img className="bg-cover" src={image} />
        </div>

        <div className="flex basis-8/12 flex-col shrink-1 grow-1 pl-2 overflow-hidden">
          <div className="flex-1 text-purple-200 font-bold overflow-x-hidden truncate">{name}</div> 
          <div className="flex-1 text-purple-300 overflow-x-hidden truncate">{artist}</div>
        </div>

        <div className=" flex basis-3/12 shrink-0 justify-evenly ">
          <Link to={`/track/${id}`}
          className="flex-1 bg-purple-950 text-white basis-1/6 p-1 text-center flex items-center justify-center font-bold text-lg "
          >Recs
          </Link>
          {url!==null && url !==undefined && url !=="" && url !==" " ?
            <button
              onClick={()=>popModal(url)}
              className="flex-1 bg-green-900 text-white basis-1/6 flex p-1 text-center items-center justify-center font-bold text-lg"
            >Listen
            </button>
          :
            null
          }
          {/** Maybe directly call the api function from here 
           * since u don't need to know what it returns... bc it doesn't return anything.
           * I guess print something on screen on if the request was succesful or not.
           */}
          {isRec?
            <button
            className="flex-1 bg-green-950 text-white basis-1/6 p-1 text-center block items-center justify-center font-bold text-lg" 
            onClick={()=>handleOnClick()}
          >Save
          </button>: null
          }
          

        </div>
      </div> 
    </>
  )
}