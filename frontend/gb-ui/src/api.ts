import { AudioFeatures, ITrack, audioFeatureNames, AudioFeatureSettings } from "./interfaces";

enum RequestMethods {
  Post = 'POST',
  Get = 'GET',
  Put = 'PUT'

}

export async function requestAuth(){

  const res:Response|null = await fetch("/api/auth/requestauth",{
      method: RequestMethods.Get,
    });


  if(res === null){
    throw new Response("Server error",{status:500})
  }

  const data = await res.json();

  if(!res.ok){
    const errorMessage = data.error.message ? data.error.message : "Server Error";
    const errorStatus = data.error.status? data.error.status : "500";
    throw new Response(errorMessage,{status: errorStatus});
  }

  return data;
}

function handleNewTokens(newAccessToken:string):boolean{

  if(!newAccessToken){
    console.log("There was an error parsing new tokens")
    return false;
  }
  localStorage.setItem('access_token', newAccessToken);
  return true;
}

export async function refreshTokens(refresh_token:string|null){

  if(refresh_token ===null){
    return {access_token:null};
  }
  let res:Response|null = null;

  const authParams = new URLSearchParams({refresh_token});

  try{
    res = await fetch("/api/auth/refresh_token?"+authParams.toString(),{
      method: RequestMethods.Get
    });
  }catch(err){
    return {access_token: null};
  }

  const data  = await res.json();
  if(!res.ok){
    const errorMessage = data.error.message ? data.error.message : "Server Error";
    const errorStatus = data.error.status? data.error.status : "500";
    throw new Response(errorMessage,{status: errorStatus});
  }
  return data;
}

export async function requestTokens(code:string|null, state:string|null){

  if (code===null || state===null){
    console.log("code or state is null");
    throw new Response("Missing code and/or state in request", {status:400});
  }

  let res:Response|null = null

  const authParams = new URLSearchParams({code,state});

    res = await fetch("/api/auth/gettokens?"+authParams.toString(),{
      method: RequestMethods.Get,
    });

  const data = await res.json();

  if(!res.ok){
    const errorMessage = data.error.message ? data.error.message : "Server Error";
    const errorStatus = data.error.status? data.error.status : "500";
    throw new Response(errorMessage,{status: errorStatus});
  }
  
  return data;
}

//SPOTIFY DATA REQUEST FUNCTIONS

export async function requestMySpotifyAccount(accessToken:string){
    //console.log("req to /me");
    const data = await sendRequest(
      "https://api.spotify.com/v1/me",
      accessToken,
      RequestMethods.Get);
    console.log(data);
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

export async function requestTopTracks(accessToken:string, range:number ){

  const inputRange:string = rangeEnum(range);

  const data = await sendRequest(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${inputRange}&limit=50`, 
    accessToken,
    RequestMethods.Get
  );
  return data;
}

export async function requestSavedTracks(pageNumber:number,tracksPerPage:number,accessToken:string){

  let totalOffset:number = pageNumber*tracksPerPage;

  if(totalOffset > 999999999){
    totalOffset = 99999999;
  }
  
  const data = await sendRequest(
    `https://api.spotify.com/v1/me/tracks?limit=${tracksPerPage}&offset=${totalOffset}`,
    accessToken,
    RequestMethods.Get
  );
  return data;
}

//MISSING sendRequest 1
export async function saveSpotifyTrack( trackId:string) :Promise<Response|null>{
  let accessToken:string|null = null;

  accessToken = localStorage.getItem("access_token");
  
  if(!accessToken || accessToken === ""){
    return null;
  }

  const data = await sendRequest(
    "https://api.spotify.com/v1/me/tracks?ids="+trackId,
    accessToken,
    RequestMethods.Put,
    false
  );

  //console.log(data);
  return data;

}

export async function requestSpotifyTrack(accessToken:string, trackId:string, isLoggedIn:boolean ){

  if(isLoggedIn){
      const data = await sendRequest(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        accessToken,
        RequestMethods.Get
      );
      return data;
  }
  else{
    const res = await fetch(`/api/spotify/gettrack?id=${trackId}`,{
      method: "GET"
    });
    const data = await res.json();
    if(!res.ok){
      throw new Response("Request failed", {status:res.status})
    }
    if(data.result){
      return data.result;
    }
    else{
      throw new Response("Bad data returned", {status: 500})
    }
  }
}

//this function is such a mess lmao. fix it at some point
export async function requestSpotifyRec(
  accessToken:string, 
  trackId:string, 
  selectedOptions: string[],
  audioFeatures:AudioFeatures, 
  audioFeatureSettings:AudioFeatureSettings,
  isLoggedIn: boolean
){
  //console.log("audioFeatureSettings",audioFeatureSettings);
  //console.log("selectedOptions",selectedOptions);

  let queryOptionSuffix:string = trackId;

  for(let i =0; i < audioFeatureNames.length; i++ ){
    if(!selectedOptions.includes(audioFeatureNames[i]) ){
      continue
    }

    const name: keyof AudioFeatures = audioFeatureNames[i] as keyof AudioFeatures ;

    const featureValue: number | undefined |string = audioFeatures[name] ;
    if(featureValue === undefined || typeof featureValue === 'string') continue;
    
    let targetValue: number = featureValue;

    switch(audioFeatureNames[i]){
      case 'acousticness':
        targetValue = audioFeatureSettings.acousticness;
        break;
      case 'danceability':
        targetValue = audioFeatureSettings.danceability;
        break;
      case 'energy':
        targetValue = audioFeatureSettings.energy;
        break;
      case 'valence':
        targetValue = audioFeatureSettings.valence;
        break;
      case 'tempo':
        targetValue = audioFeatureSettings.tempo;
        break;
      case 'duration_ms':
        targetValue = audioFeatureSettings.duration_ms*1000;
        break;
      case 'key':
        targetValue=audioFeatureSettings.key;
        break;
      case 'mode':
        targetValue = audioFeatureSettings.mode === true ? 1 : 0;
        break;
      
      default:
        targetValue = featureValue;
    }
    
      queryOptionSuffix+=  `&target_${name}=${targetValue}`
      
  }
  if(selectedOptions.includes("popularity") ){
    queryOptionSuffix+=`&target_popularity=${audioFeatureSettings.popularity }`
  }

  //console.log("queryOptionSuffix",queryOptionSuffix);


  if(isLoggedIn){
      const data = await sendRequest(
        `https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=${queryOptionSuffix}`,
        accessToken,
        RequestMethods.Get
      );
      return data;
  }
  else{
      const res = await fetch(`/api/spotify/getrecs?querysuffix=${encodeURIComponent(queryOptionSuffix)}`,{
        method: "GET"
      });
      const data = await res.json();
      if(!res.ok){
        throw new Response("Request failed",{status:res.status});
      }
      if(data.result){
        return data.result;
      }
      else{
        throw new Response("Server returned bad data",{status:500})
      }
  }
}

export async function requestSpotifyTrackAudioFeatures(accessToken:string, trackId:string, isLoggedIn: boolean){

  if(isLoggedIn){
      const data = await sendRequest(
        `https://api.spotify.com/v1/audio-features/${trackId}`, 
        accessToken,
        RequestMethods.Get
      );
      return data;
  }
  else{

      const res = await fetch(`/api/spotify/getaudiofeatures?id=${trackId}`,{
        method: "GET"
      });

      const data = await res.json();

      if(!res.ok){
        throw new Response("Request failed",{status:res.status})
      }
      if(data.result){
        return data.result;
      }
      else{
        throw new Response("Bad data returned",{status:500})
      }
  }
}

export async function requestSaveStatus (accessToken:string|null,tracks: ITrack[] ): Promise<boolean[]> {

  if(tracks.length === 0){
    return [];
  }

  if(accessToken === null ||accessToken === undefined || accessToken === "") {
    return [];
  }

  let queryString: string="";

    for(let i=0; i<tracks.length;i++){
      queryString = queryString + tracks[i].id+","
    }

    if(queryString.length > 4){
      queryString = queryString.substring(0, queryString.length-1);
    }

    const data = await sendRequest(
      `https://api.spotify.com/v1/me/tracks/contains?ids=`+queryString,
      accessToken,
      RequestMethods.Get
    );
    return data;
}

export async function sendTrackSeenRequest(track:ITrack,audioFeatures:AudioFeatures){

  let isLoggedIn:boolean = true;

  const accessToken:string|null = localStorage.getItem("access_token");
  const displayName:string|null = localStorage.getItem("greenbeans_user");
  const userId:string|null = localStorage.getItem("greenbeans_user_id");

  if(accessToken === null || accessToken === undefined || accessToken === ""){
    isLoggedIn = false;
  }
  else if(displayName === null || displayName === undefined || displayName === ""){
    isLoggedIn = false;
  }
  else if(userId === null || userId === undefined || userId === ""){
    isLoggedIn = false;
  }

  let payload = null;

  if(isLoggedIn === false){
    payload = {
      track:track,
      audioFeatures:audioFeatures,
    }
  }
  else{
    payload = {
      user:{id:userId,displayName:displayName, access_token:accessToken},
      track:track,
      audioFeatures:audioFeatures,
    }
  }

  try{
    const res = await fetch('/api/history/trackseen',{
      method: RequestMethods.Post,
      headers: {
        'Authorization':  'Bearer '+ accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if(!res.ok){
      //throw new Response("Request failed",{status:res.status})
      console.log("history request failed",{status:res.status})
    }
    try{
      console.log(await res.json());
    }catch(err){
      console.log("history returned non json",{status:500})
      console.log(res);
    }
  }catch(err){
    //throw new Response("Request failed",{status:500})
    console.log("history request failed",{status:500})
  }

}

async function sendRequest(endpoint:string, accessToken:string,requestMethod:RequestMethods,expectsJson:boolean=true){

  console.log('request to '+endpoint)
  let res:Response|null = null

  res = await fetch(endpoint,{
    method: requestMethod,
    headers: {
      Authorization:  'Bearer '+ accessToken
      //Authorization:  'Bearer e'+ accessToken
    }
  });

  if(res === null){
    throw new Response("Server error", {status:500}) ;
  }

  if( res.status === 401){
    const {access_token} = await refreshTokens(localStorage.getItem('refresh_token'));
    console.log("refreshed access token: "+access_token);
    if (access_token== null){
      throw new Response("Error refreshing tokens",{status:500})
    }
    const tokensHandled:boolean = handleNewTokens(access_token);

    if(!tokensHandled){
      console.log("token refresh unsuccessful");
    }

    res = await fetch(endpoint, {
      method: "GET", 
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    })

  }
  if(!expectsJson){
    return res;
  }

  let data = null;
  
  try{
    data = await res.json();
  }catch(err){
    throw new Response("Could not parse json",{status:409})
  }
  
    if(!res.ok || data === null){
      const errorMessage = data.error.message ? data.error.message : "Server Error";
      const errorStatus = data.error.status? data.error.status : "500";
      throw new Response(errorMessage,{status: errorStatus});
    }
    return data;
}