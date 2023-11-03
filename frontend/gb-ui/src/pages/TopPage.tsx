import { redirect } from "react-router-dom";

import { requestTokens } from "../api"

interface FetchRequest{
  request:Request
}


export async function loader({request}:FetchRequest){
  console.log("loader params");
  //console.log(params.code);
  //console.log(params.state);
  const url = new URL(request.url);
  const authCode = url.searchParams.get("code");
  const authState = url.searchParams.get("state");

  try{
    const {access_token, refresh_token} = await  requestTokens(authCode,authState);
    
    console.log("data.access_token: "+access_token);
    console.log("data.refresh_token "+refresh_token);
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token',refresh_token);
    return redirect("/real-top");
  }catch(err){
    console.log("there was an error in the loader");
    console.log(err);
    return err;
  }
}
export default function TopPage(){
  console.log("in top page");
  console.log(localStorage)

  return(
    <>
      <h1>This is the top page</h1>
    </>
  )
  
}