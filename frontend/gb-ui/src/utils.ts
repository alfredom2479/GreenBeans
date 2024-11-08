import { Dispatch,  SetStateAction } from "react";
import { AudioFeatures, ITrack, TrackSaveState } from "./interfaces";
//import {Stores,addTrackList} from "./idb"
import {didb} from "./dexiedb"
const parseListLoaderData = 
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
  (loaderData: any, setTrackList:Dispatch<SetStateAction<ITrack[]>>, isTopList:boolean)=>{

    if(typeof loaderData === 'object' && loaderData !== null && 'list' in loaderData
      && 'usingIdbData' in loaderData && Array.isArray(loaderData.list)
      && typeof loaderData.usingIdbData === 'boolean' && 'id' in loaderData
      && typeof loaderData.id === "string"){
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const isTrackProperFunction = isTopList ? isTrack : (li:any)=>{return isTrack(li.track)}
      const trackCheckFunction = loaderData.usingIdbData === false ? isTrackProperFunction : isITrackObject;
      const loaderItems = loaderData.list;
      const tempTrackList:ITrack[] = [];
      let possibleTrack:ITrack|null = null
    
      for(let i=0; i < loaderItems.length;i++){
        possibleTrack = trackCheckFunction(loaderItems[i]);
        if(possibleTrack != null) tempTrackList.push(possibleTrack);
      }

      setTrackList(tempTrackList);
      if(loaderData.usingIdbData === false && tempTrackList.length > 0){
      //addTrackList(Stores.TrackLists,tempTrackList,loaderData.id);
      addTracksToDidb(tempTrackList,loaderData.id);
      } 
  }
}

const addTracksToDidb = async (trackList:ITrack[],trackListId:string)=>{
  const idList:string[] = [];

  for(let i=0; i < trackList.length; i++){
    try{
      idList.push(trackList[i].id);
      await didb.tracks.add(trackList[i]);
    }
    catch(err){
      console.log("error adding track to dexie "+err);
    }
  }
  try{
    const res = await didb.track_lists.put(idList,trackListId);
    console.log(res);
  }
  catch(err){
    console.log("error adding track list to dexie ");
    console.log(err);
  }
}

const getTrackListFromDidb = async (id:string):Promise<ITrack[]|null>=>{
  return new Promise( async (resolve)=>{
    let trackListIdList:string[]|null = null;
    //check if track list exists and if its valid
    try{
      trackListIdList= await didb.track_lists.get(id) || null;
      //console.log(trackListIdList);
    }
    catch(err){
      console.log("error getting track list from dexie ");
      console.log(err);
      resolve(null);
      return;
    }

    if(trackListIdList === null){
      resolve(null);
      return;
    }

    const trackList:ITrack[] = [];
    let possibleITrack:ITrack|null = null;
    for(let i = 0; i < trackListIdList.length; i++){
      try{
        possibleITrack = await didb.tracks.get(trackListIdList[i]) || null;
        if(possibleITrack === null){
          //if 1 to n-1 tracks are missing, list quality is unacceptable.
          //Also signal that indexedDB is in an incomplete state.
          resolve(null);
          return;
        }
      }
      catch(err){
        console.log("error getting track from dexie ");
        console.log(err);
        resolve(null);
        return;
      }
      trackList.push(possibleITrack);
    }
    resolve(trackList);
    return;
  })
  
}

async function clearAllDexieTables() {
  console.log("clearing all dexie tables");
  await didb.transaction('rw', didb.tables, async () => {
    for (const table of didb.tables) {
      try{
        await table.clear();
        console.log("cleared table: "+table.name);
      }
      catch(err){
        console.log("error clearing dexie table: "+table.name);
        console.log(err);
      }
    }
  });
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isTrack = (possibleTrack: any, size:number=0): ITrack|null=>{

  const tempTrack:ITrack = {id: "", name:"",artist:"",image:"",trackSaveState:TrackSaveState.CantSave} ;

  if(possibleTrack === null || possibleTrack === undefined){
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
  parseListLoaderData,
  isTrack,
  isITrackObject,
  isAudioFeatures,
  addTracksToDidb,
  getTrackListFromDidb,
  clearAllDexieTables
}
