export async function requestAuth(){

  let res:Response|null = null

  try{
    res = await fetch("/api/auth/requestauth",{
      method: "GET",
    });
  }catch(err){
    console.log(err)
    throw{err}
  }

  const data = await res.json();
  if(!res.ok){
    throw{
      message: data.message,
      statusText: data.statusText,
      status: data.status
    };
  }

  return data;
}

export async function requestTokens(code:string|null, state:string|null){

  console.log("code: "+code);
  console.log("statte: "+state);
  if (code===null || state===null){
    console.log("code or state is null");
    throw(new Error("Code or state are null"));
  }
  let res:Response|null = null

  const authParams = new URLSearchParams({code,state});
  console.log(authParams.toString());

  console.log("in requestTokens");
  try{
    res = await fetch("/api/auth/gettokens?"+authParams.toString(),{
      method: "GET",
    });
  }catch(err){
    console.log(err)
    throw{err}
  }

  console.log(res);

  const data = await res.json();
  if(!res.ok){
    throw{
      message: data.message,
      statusText: data.statusText,
      status: data.status
    };
  }

  return data;
}


export async function requestMySpotifyAccount(access_token:string){

  console.log("in rmsa; access_token: "+access_token);
  let res:Response|null = null

  try{
    res = await fetch("https://api.spotify.com/v1/me",{
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    });
  }catch(err){
    console.log(err)
    throw{err}
  }

  console.log(res);

  const data = await res.json();
  if(!res.ok){
    throw{
      message: data.message,
      statusText: data.statusText,
      status: data.status
    };
  }

  return data;
}

const rangeEnum =(rangeNum:number):string=> {
  switch(rangeNum){
    case 0:
      return "short_term";
    case 1:
      return "medium_term";
    default:
      return "long_term";
  }
}

export async function requestTopTracks(access_token:string, range:number ){

  const inputRange:string = rangeEnum(range);
  console.log("in rmsa; access_token,range: "+access_token+","+range);
  let res:Response|null = null

  try{
    res = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${inputRange}&limit=5`,{
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    });
  }catch(err){
    console.log(err)
    throw{err}
  }

  console.log(res);

  const data = await res.json();
  if(!res.ok){
    throw{
      message: data.message,
      statusText: data.statusText,
      status: data.status
    };
  }

  return data;
}