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
  let res:Response|null = null

  try{
    res = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${inputRange}&limit=50`,{
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + access_token
      }
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

export async function requestSpotifyTrack(access_token:string, trackId:string ){

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

  //NOTE
  //u might have to organize the results in best match to worse match
  //Audio Features is the actual data for the given track
  //Options selected is the features that the user has selected
  //to filter by
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


  //iterate through selectedOptions and form suffix
  let queryOptionSuffix:string = trackId;

  //iterate through audioFeatures and add to suffix string
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
    
    //console.log(`${audioFeatureNames[i]} value: `+featureValue)

      if(featureValue !== -999){
        queryOptionSuffix+=`&target_${name}=${featureValue}`
        queryOptionSuffix+=`&min_${name}=${ lowerLimit }`
        queryOptionSuffix+=`&max_${name}=${ upperLimit}`
      }
      
  }
  //const testString:string = "acousticness";
  


  //console.log("final query suffix: "+queryOptionSuffix);
  /*
  for(const value in selectedOptions){
    queryOptionSuffix+=`&$`;
  }
  */

  let res:Response|null = null

  try{
    res= await fetch(`https://api.spotify.com/v1/recommendations?limit=99&seed_tracks=${queryOptionSuffix}`,{
      method: "GET",
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    });
  }catch(err){
    console.log(err)
    throw{err}
  }

  //console.log("The recs response")

  const data = await res.json();
  //console.log(data);
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
    if(res.status === 401){
      console.log("The status code is 401")

    }
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