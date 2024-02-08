import { redirect } from "react-router-dom";

import { requestTokens } from "../api"

interface FetchRequest{
  request:Request
}


export async function loader({request}:FetchRequest){
  const url = new URL(request.url);
  const authCode = url.searchParams.get("code");
  const authState = url.searchParams.get("state");

    const {access_token, refresh_token} = await  requestTokens(authCode,authState);
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token',refresh_token);
    return redirect("/top");
}
export default function AuthPage(){

  return(
    <>
      <h1>Authenticating...</h1>
    </>
  )
  
}