import { ITrack } from "./interfaces";

let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;
const dbName = "greenbeansDB";

export enum Stores {
  Tracks = 'tracks'
}

export const openIDB = ()=>{
  request = indexedDB.open(dbName);

  request.onupgradeneeded = () => {
    console.log("openIDB - upgrade needed");
    db = request.result;
  }

  if(!db.objectStoreNames.contains(Stores.Tracks)){
    console.log("creating tracks store...");
    db.createObjectStore(Stores.Tracks, {keyPath: 'id'});
  }
  
  request.onsuccess = (event) => {
    console.log("openIDB - onsuccess");
    console.log(event);
    db = request.result;

    version = db.version;
  };

  request.onerror = (event) => {

    console.log("There ahs been an error opening IndexedDB Database");
    console.log(event);
  }
}

export const addITrack = (storeName:string,data:ITrack)=>{
  request = indexedDB.open(dbName,version);

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