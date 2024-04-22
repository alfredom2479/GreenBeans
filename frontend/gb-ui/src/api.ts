import { AudioFeatures, ITrack, audioFeatureNames } from "./interfaces";

export async function requestAuth(){

  const res:Response|null = await fetch("/api/auth/requestauth",{
      method: "GET",
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
      method:"GET"
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
      method: "GET",
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
    const data = await sendRequest("https://api.spotify.com/v1/me", accessToken);
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
    accessToken
  )
  return data;
}

export async function requestSavedTracks(pageNumber:number,tracksPerPage:number,accessToken:string){

  let totalOffset:number = pageNumber*tracksPerPage;

  if(totalOffset > 999999999){
    totalOffset = 99999999;
  }
  
  const data = await sendRequest(`https://api.spotify.com/v1/me/tracks?limit=${tracksPerPage}&offset=${totalOffset}`,accessToken);
  return data;
}

export async function saveSpotifyTrack( trackId:string) :Promise<Response|null>{
  let res:Response|null = null;
  let accessToken:string|null = null;

  accessToken = localStorage.getItem("access_token");
  
  if(!accessToken || accessToken === ""){
    return null;
  }

  res = await fetch("https://api.spotify.com/v1/me/tracks?ids="+trackId,{
    method: "PUT",
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });
  if(!res.ok){
    return null;
  }

  return res;
}

export async function requestSpotifyTrack(accessToken:string, trackId:string, isLoggedIn:boolean ){

  if(isLoggedIn){
      const data = await sendRequest(`https://api.spotify.com/v1/tracks/${trackId}`,accessToken);
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

export async function requestSpotifyRec(accessToken:string, trackId:string, selectedOptions: string[],audioFeatures:AudioFeatures, isLoggedIn: boolean){

  let queryOptionSuffix:string = trackId;

  for(let i =0; i < audioFeatureNames.length; i++ ){
    if(!selectedOptions.includes(audioFeatureNames[i]) ){
      continue
    }

    const name: keyof AudioFeatures = audioFeatureNames[i] as keyof AudioFeatures ;

    const featureValue: number | undefined = audioFeatures[name] ;
    if(featureValue === undefined) continue;
    
    let upperLimit: number = featureValue;
    let lowerLimit: number = featureValue;

    switch(audioFeatureNames[i]){
      case 'tempo':
        upperLimit = +(featureValue + 10).toFixed(4);
        lowerLimit = +(featureValue - 10).toFixed(4);
        break;
      case 'duration_ms':
        upperLimit = +(featureValue + 30000).toFixed(1);
        lowerLimit = +(featureValue - 30000).toFixed(1);
        break;
      case 'time_signature' :
      case 'key':
      case 'mode':
        upperLimit = featureValue;
        lowerLimit = featureValue;
        break;
      
      default:
        upperLimit = +(featureValue + .15).toFixed(4);
        lowerLimit = +(featureValue - .15).toFixed(4);
        if(upperLimit > 1){
          upperLimit =1;
        }
        if(lowerLimit < 0){
          lowerLimit=0;
        }
    }
    
      queryOptionSuffix+=`&target_${name}=${featureValue}`
      queryOptionSuffix+=`&min_${name}=${ lowerLimit }`
      queryOptionSuffix+=`&max_${name}=${ upperLimit}`
      
  }


  if(isLoggedIn){
      const data = await sendRequest(
        `https://api.spotify.com/v1/recommendations?limit=50&seed_tracks=${queryOptionSuffix}`,
        accessToken);
      return data;
  }
  else{
      const res = await fetch(`/api/spotify/getrecs?querysuffix=${encodeURIComponent(queryOptionSuffix)}`,{
        method: "GET"
      });
      //console.log(res);
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
      const data = await sendRequest(`https://api.spotify.com/v1/audio-features/${trackId}`, accessToken)
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

export async function requestSaveStatus (accessToken:string|null,tracks: ITrack[] ) {
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

    const data = await sendRequest(`https://api.spotify.com/v1/me/tracks/contains?ids=`+queryString,accessToken)
    return data;
}

async function sendRequest(endpoint:string, accessToken:string){

  //console.log('request to '+endpoint)
  let res:Response|null = null

  res = await fetch(endpoint,{
    method: "GET",
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
        // Authorization: 'Bearer 69' + access_token
      }
    })
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