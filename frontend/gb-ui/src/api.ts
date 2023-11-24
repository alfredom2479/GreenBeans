import { AudioFeatures } from "./interfaces";

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
  console.log(data);
  if(!res.ok){
    throw{
      message: data.message,
      statusText: data.statusText,
      status: data.status
    };
  }

  return data;
}

export async function requestSpotifyTrack(access_token:string, trackId:string ){

  console.log("in rst; access_token,range: "+access_token+","+trackId);
  let res:Response|null = null

  try{
    res= await fetch(`https://api.spotify.com/v1/tracks/${trackId}`,{
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

export async function requestSpotifyRec(access_token:string, trackId:string, selectedOptions: string[],audioFeatures:AudioFeatures){

  const audioFeatureNames: (keyof AudioFeatures)[] = [
    'acousticness' ,
    'danceability' ,
    'energy' ,
    'liveness' ,
    'valence' 
  ]
  console.log("in req spot rec; access_token,range: "+access_token+","+trackId);
  console.log(selectedOptions);

  //iterate through selectedOptions and form suffix
  let queryOptionSuffix:string = trackId;

  //iterate through audioFeatures and add to suffix string
  for(const audioFeatureName in audioFeatureNames ){

    const name: keyof AudioFeatures = audioFeatureName as keyof AudioFeatures ;
    const featureValue: number = audioFeatures[name] || -999;

      if(featureValue !== -999){
        queryOptionSuffix+=`&target_${name}=${featureValue}`
        queryOptionSuffix+=`&min_${name}=${ featureValue-.1 }`
        queryOptionSuffix+=`&max_${name}=${featureValue+.1}`
      }
      
  }
  //const testString:string = "acousticness";
  

  console.log("final query suffix: "+queryOptionSuffix);
  /*
  for(const value in selectedOptions){
    queryOptionSuffix+=`&$`;
  }
  */

  let res:Response|null = null

  try{
    res= await fetch(`https://api.spotify.com/v1/recommendations?limit=5&seed_tracks=${queryOptionSuffix}`,{
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    });
  }catch(err){
    console.log(err)
    throw{err}
  }

  console.log("The recs response")

  const data = await res.json();
  console.log(data);
  if(!res.ok){
    throw{
      message: data.message,
      statusText: data.statusText,
      status: data.status
    };
  }

  return data;
}

export async function requestSpotifyTrackAudioFeatures(access_token:string, trackId:string ){

  console.log("in rsr; access_token,range: "+access_token+","+trackId);
  let res:Response|null = null

  //might not neet to send bearer token for this endpoint
  try{
    res= await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`,{
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    });
  }catch(err){
    console.log(err);
    throw{err};
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
//sample rec request endpoint
//'https://api.spotify.com/v1/recommendations?seed_tracks=0c6xIDDpzE81m2q797ordA'