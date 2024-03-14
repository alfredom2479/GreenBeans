import { ITrack, TrackSaveState } from "./interfaces";

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

  return tempTrack;
}

export {
  isTrack
}