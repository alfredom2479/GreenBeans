import { ITrack } from "./interfaces";

let request: IDBOpenDBRequest;
let db: IDBDatabase;
const version = 1;

export enum Stores {
  Tracks = 'tracks'
}


export const addITrack = (storeName:string,data:ITrack)=>{
  request = indexedDB.open('greenbeansDB',version);

  request.onsuccess = () =>{
    console.log("request.onsuccess - addData",data);
    db = request.result;
    const transaction = db.transaction(storeName,'readwrite');
    const store = transaction.objectStore(storeName);
    store.add(data);
  };

  request.onerror = () => {
    const error = request.error?.message;
    if(error){
      console.log(error);
    }
    else{
      console.log("Unknown Error has occured");
    }
  };

  request.onupgradeneeded = () => {
    db = request.result;

    db.createObjectStore(Stores.Tracks, {keyPath: 'id'});
  }

}