//import {useState} from "react"
import { Form, redirect } from "react-router-dom";
import type {Params} from "react-router-dom";
import { requestSpotifyTrackAudioFeatures } from "../api";
//import { requestSpotifyRec } from "../api";

interface IURLParams{
  params: Params
}

export async function loader({params}:IURLParams){
  console.log("in rec options section loader");
  console.log(params);
  let trackId:string = "bad_track_id";

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
    console.log(trackId);
  }
  else{
    return redirect("/");
  }

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token ||access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestSpotifyTrackAudioFeatures(access_token,trackId);
    console.log(data);
    return data;
  }catch(err){
    console.log("there has been a req options loader error");
    console.log(err);
    throw err;
  }
}

export async function action({params,}:IURLParams){
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

  return redirect("../recs?test&wedabest")

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