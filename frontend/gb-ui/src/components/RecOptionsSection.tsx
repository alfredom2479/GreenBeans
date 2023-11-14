//import {useState} from "react"
import { Form, redirect } from "react-router-dom";
import type {Params} from "react-router-dom";
//import { requestSpotifyRec } from "../api";

interface IURLParams{
  params: Params
}

export async function action({params}:IURLParams){
  console.log("in action");
  console.log(params);
  let trackId:string = "bad_track_id";

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
    console.log(trackId);
  }
  else{
    return redirect("/");
  }

  return redirect("../recs")

  //dont even try to request if u do not have
  //access token or a trackId
  

  /*
  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token ||access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestSpotifyRec(access_token,trackId);
    console.log(data);

   if(data.tracks && Array.isArray(data.tracks)){
    return data.tracks;
   } 

   return [];
  }catch(err){
    console.log("there has been a rec action error");
    console.log(err);
    throw err;
  }
  */


}


export default function RecOptionsSection(){

  //const [isSelectingOptions, setIsSelectingOptions] = useState(true);


  return(
    <>
    <h1>
      This is where u input ur stuff
    </h1> 
    <Form method="post">
      <label htmlFor="checkbox">test box: </label>
      <input name="test" id="checkbox" type="checkbox"></input>
      <br/>
      <button type="submit"
      className="bg-green-900 text-purple-300 p-2 rounded-full"
      >
        Recommend!
      </button>
    </Form>
    </>
  )
}