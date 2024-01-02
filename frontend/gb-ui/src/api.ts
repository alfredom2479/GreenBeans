import { AudioFeatures } from "./interfaces";

//INITIAL AUTH FUNC
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

//TOKEN HANDLERS

function handleNewTokens(newAccessToken:string):boolean{

  console.log("new at: "+newAccessToken);
  if(!newAccessToken){
    console.log("There was an error parsing new tokens")
    return false;
  }

  localStorage.setItem('access_token', newAccessToken);
  console.log("local storage after success:")
  console.log(localStorage);
  return true;

}

export async function refreshTokens(refresh_token:string|null){

  if(refresh_token ===null){
    console.log("Refresh token is null");
    throw(new Error("Refresh token is null fam"));
  }
  let res:Response|null = null

  const authParams = new URLSearchParams({refresh_token});

  try{
    res = await fetch("/api/auth/refresh_token?"+authParams.toString(),{
      method:"GET"
    });
  }catch(err){
    console.log(err);
    throw(err)
  }

  const data  = await res.json();
  if(!res.ok){
    throw{
      message:data.message,
      statusText: data.statusText,
      status: data.status
    };
  }
  return data;
}

export async function requestTokens(code:string|null, state:string|null){

  if (code===null || state===null){
    console.log("code or state is null");
    throw(new Error("Code or state are null"));
  }

  let res:Response|null = null

  const authParams = new URLSearchParams({code,state});

  try{
    res = await fetch("/api/auth/gettokens?"+authParams.toString(),{
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

//SPOTIFY DATA REQUEST FUNCTIONS

export async function requestMySpotifyAccount(accessToken:string){

  try{
    const data = await sendRequest("https://api.spotify.com/v1/me", accessToken);
    return data;
  }catch(err){
    console.log("There has been a req spotify account oopsie");
    console.log(err);
  }
  
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

  try{
    const data = await sendRequest(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${inputRange}&limit=50`, 
      accessToken
    )
    return data;
  }catch(err){
      console.log("There has been an api top tracks oopsie");
      console.log(err);
  }
}

export async function requestSavedTracks(accessToken:string){
  
  try{
    const data = await sendRequest(`https://api.spotify.com/v1/me/tracks`,accessToken);
    return data;
  }catch(err){
    console.log("There has been a saved tracks api oopsie");
    console.log(err);
  }
}

export async function saveSpotifyTrack( trackId:string) :Promise<Response|null>{
  let res:Response|null = null;
  let accessToken:string|null = null;

  accessToken = localStorage.getItem("access_token");
  
  if(!accessToken || accessToken === ""){
    console.log("unable to save track, bad token")
    return null;
  }

  res = await fetch("https://api.spotify.com/v1/me/tracks?ids="+trackId,{
    method: "PUT",
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });
  console.log(res);
  //const data = await res.json();
  if(!res.ok){
    throw{
      error: "Oopsies in save track put request"
    };
  }

  return res;
}

export async function requestSpotifyTrack(accessToken:string, trackId:string ){

  try{
    const data = await sendRequest(`https://api.spotify.com/v1/tracks/${trackId}`,accessToken);
    return data;
  }catch(err){
    console.log("There has been a req top tracks oopsie");
    console.log(err);
  }

}

//Selected options - The features that the user has selected
//audioFeatures - the numerical values for the fesatures of the current track

export async function requestSpotifyRec(accessToken:string, trackId:string, selectedOptions: string[],audioFeatures:AudioFeatures){

  //NOTE
  //u might have to organize the results in best match to worse match
  //Audio Features is the actual data for the given track
  //Options selected is the features that the user has selected
  //to filter by
  
  //You have to make this a universal value so that there are no
  //inconsistencies between different variables that are supposed to 
  //represent this same thing
  const audioFeatureNames: (keyof AudioFeatures)[] = [
    'acousticness' ,
    'danceability' ,
    'energy' ,
    'liveness' ,
    'valence' ,
    'tempo',
    'duration_ms',
    'time_signature',
    'instrumentalness',
    'key',
    'mode'
  ]

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

  try{
    const data = await sendRequest(
      `https://api.spotify.com/v1/recommendations?limit=99&seed_tracks=${queryOptionSuffix}`,
      accessToken);
    return data;
  }catch(err){
    console.log("there has been a request recommendation oopsie");
    console.log(err);
  }

}

export async function requestSpotifyTrackAudioFeatures(accessToken:string, trackId:string ){

  try{
    const data = await sendRequest(`https://api.spotify.com/v1/audio-features/${trackId}`, accessToken)
    return data;

  }catch(err){
    console.log("there has been an api oopsie");
    console.log(err);
  }
}

//MAIN SEND REQUEST function
//u might be able to abstract this further
async function sendRequest(endpoint:string, accessToken:string){
  let res:Response|null = null

  res = await fetch(endpoint,{
    method: "GET",
    headers: {
      Authorization:  'Bearer '+ accessToken
    }
  });

  if(res.status === 401){
    const {access_token} = await refreshTokens(localStorage.getItem('refresh_token'));
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

  const data = await res.json();
  if(!res.ok){
    throw{
      message: data.message,
      statusText: data.statusText,
      status: data.status
    };
  }

  return data
}