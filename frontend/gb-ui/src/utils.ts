import { AudioFeatures, ITrack, TrackSaveState } from "./interfaces";

// If parsing like this is too slow, there might be an automatic way to do it.
//something like Golang's Unmarshal. Look into this. custom way might be faster.

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isTrack = (possibleTrack: any, size:number=0): ITrack|null=>{

  const tempTrack:ITrack = {id: "", name:"",artist:"",image:"",trackSaveState:TrackSaveState.CantSave} ;

  if(possibleTrack === null && possibleTrack === undefined){
    return null;
  }

  if(possibleTrack.id && possibleTrack.name){
    tempTrack.id = possibleTrack.id;
    tempTrack.name = possibleTrack.name
  }
  else{
    return null;
  }

  if(possibleTrack.artists && Array.isArray(possibleTrack.artists) && 
    possibleTrack.artists.length >0 && possibleTrack.artists[0].name){
      tempTrack.artist = possibleTrack.artists[0].name;
  }
  else{
    return null;
  }

  const maxImgSize:number = size === 1 ? 1000 :500;
  
  //deciding that track image is not necessary. Do not return null if cant find one
  if(possibleTrack.album && possibleTrack.album.images &&
    Array.isArray(possibleTrack.album.images) && possibleTrack.album.images.length > 0){
      const albumImages = possibleTrack.album.images;

      let i = 0 
      for(i = 0; i < albumImages.length; i++){
        if(albumImages[i].height < maxImgSize){
          break;
        }
      }
      
      tempTrack.image = albumImages[i].url; 
  }

  if(possibleTrack.preview_url){
    tempTrack.url = possibleTrack.preview_url;
    //choosing not to link to external_url
    //just show that preview is not available in the UI
  }

  if(possibleTrack.external_urls && possibleTrack.external_urls.spotify){
    tempTrack.spotify_url = possibleTrack.external_urls.spotify;
  }
  
  return tempTrack;
}


// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isITrackObject = (possibleITrack:any):ITrack|null=>{
  
  const tempTrack:ITrack = {
    id: "", 
    name:"",
    artist:"",
    image:"",
    trackSaveState:TrackSaveState.CantSave
  };

  if(typeof possibleITrack === 'object' && possibleITrack){

    if(possibleITrack.id && typeof possibleITrack.id === 'string'){
      tempTrack.id = possibleITrack.id;
    }
    else{
      return null;
    }

    if(possibleITrack.name && typeof possibleITrack.name === 'string'){
      tempTrack.name = possibleITrack.name;
    }
    else{
      return null;
    }

    if(possibleITrack.artist && typeof possibleITrack.artist === "string"){
      tempTrack.artist = possibleITrack.artist;
    }
    else{
      return null;
    }

    if(possibleITrack.image && typeof possibleITrack.image === "string"){
      tempTrack.image = possibleITrack.image;
    }
    else{
      return null;
    }

    if(possibleITrack.url && typeof possibleITrack.url === "string"){
      tempTrack.url = possibleITrack.url;
    }

    if(possibleITrack.trackSaveState && typeof possibleITrack.trackSaveState === 'number' 
        && possibleITrack.trackSaveState > -1 && possibleITrack.trackSaveState < 3
    ){
      tempTrack.trackSaveState = possibleITrack.trackSaveState;
    }
    //ur gonna still have to check if each track is saved each time
    //u load a rec list
  }

  return tempTrack; 
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isAudioFeatures =(possibleAudioFeatures:any):AudioFeatures|null =>{
  const tempAudioFeatures:AudioFeatures = {id:""};

  if('id' in possibleAudioFeatures && typeof possibleAudioFeatures.id === 'string'){
    tempAudioFeatures.id = possibleAudioFeatures.id;
  }
  else{
    return null;
  }

  if('acousticness' in possibleAudioFeatures && typeof possibleAudioFeatures.acousticness === 'number'){
    tempAudioFeatures.acousticness = possibleAudioFeatures.acousticness;
  }
  if('danceability' in possibleAudioFeatures && typeof possibleAudioFeatures.danceability === 'number'){
    tempAudioFeatures.danceability = possibleAudioFeatures.danceability;
  }
  if('energy' in possibleAudioFeatures && typeof possibleAudioFeatures.energy === 'number'){
    tempAudioFeatures.energy = possibleAudioFeatures.energy;
  }
  if('liveness' in possibleAudioFeatures && typeof possibleAudioFeatures.liveness=== 'number'){
    tempAudioFeatures.liveness = possibleAudioFeatures.liveness;
  }
  if('valence' in possibleAudioFeatures && typeof possibleAudioFeatures.valence === 'number'){
    tempAudioFeatures.valence = possibleAudioFeatures.valence;
  }
  if('tempo' in possibleAudioFeatures && typeof possibleAudioFeatures.tempo=== 'number'){
    tempAudioFeatures.tempo = possibleAudioFeatures.tempo;
  }
  if('duration_ms' in possibleAudioFeatures && typeof possibleAudioFeatures.duration_ms === 'number'){
    tempAudioFeatures.duration_ms = possibleAudioFeatures.duration_ms;
  }
  if('time_signature' in possibleAudioFeatures && typeof possibleAudioFeatures.time_signature === 'number'){
    tempAudioFeatures.time_signature = possibleAudioFeatures.time_signature;
  }
  if('instrumentalness' in possibleAudioFeatures && typeof possibleAudioFeatures.instrumentalness === 'number'){
    tempAudioFeatures.instrumentalness = possibleAudioFeatures.instrumentalness;
  }
  if('key' in possibleAudioFeatures && typeof possibleAudioFeatures.key=== 'number'){
    tempAudioFeatures.key = possibleAudioFeatures.key;
  }
  if('mode' in possibleAudioFeatures && typeof possibleAudioFeatures.mode=== 'number'){
    tempAudioFeatures.mode = possibleAudioFeatures.mode;
  }
  return(tempAudioFeatures);
}


export {
  isTrack,
  isITrackObject,
  isAudioFeatures
}