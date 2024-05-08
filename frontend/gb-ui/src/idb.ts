import { AudioFeatures, ITrack } from "./interfaces";

let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 2;
const dbName = "greenbeansDB";

export enum Stores {
  Tracks = 'tracks',
  AudioFeatures = 'audio_features'
}

export const openIDB = ()=>{
  request = indexedDB.open(dbName,version);

  request.onupgradeneeded = () => {
    console.log("openIDB - upgrade needed");
    db = request.result;

    if(!db.objectStoreNames.contains(Stores.Tracks)){
      console.log("creating tracks store...");
      db.createObjectStore(Stores.Tracks, {keyPath: 'id'});
    }

    if(!db.objectStoreNames.contains(Stores.AudioFeatures)){
      console.log("creating audio features stores...");
      db.createObjectStore(Stores.AudioFeatures,{keyPath:'id'});
    }
  }

  request.onsuccess = (event) => {
    console.log("openIDB - onsuccess");
    //console.log(event);
    db = request.result;

    version = db.version;
  };

  request.onerror = (event) => {

    console.log("There ahs been an error opening IndexedDB Database");
    console.log(event);
  }
}

export const addITrack = async (storeName:string,data:ITrack)=>{
  request = indexedDB.open(dbName,version);

  request.onsuccess = () =>{
    console.log("request.onsuccess - addITrack",data);
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

}

export const updateITrack = (storeName:string, key:string,data:ITrack)=>{

  request = indexedDB.open(dbName, version);

  request.onsuccess = ()=>{
    console.log('onsuccess - update data', key);
    db = request.result;
    const transaction = db.transaction(storeName,'readwrite');
    const store = transaction.objectStore(storeName);

    store.put(data);
    //in case we want to implement this func so that it can be used
    //without the complete data

    /*
      const res = store.get(key);
      res.onsuccess=()=>{
        const newData = {...res.result, ...data};
        store.put(newData);
      }
      res.onerror = (event) =>{
          console.log("there has been an error getting data with given key:",key);
          console.log(event);
      }
    */
    
  }
}

export const getITrack= (storeName:string,key:string):Promise<ITrack|null>=>{
  return new Promise((resolve)=>{

    request = indexedDB.open(dbName);

    request.onsuccess = () => {
      console.log("request.onsucces = getITrack");
      db = request.result;

      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const res = store.get(key);

      res.onsuccess = ()=>{
        //console.log("get data success");
        //console.log(res.result);
        resolve(res.result);
        //resolve("test");
      }

      res.onerror = ()=>{
        console.log("getData error")
        resolve(null);
      }
    }
  })
}
export const addAudioFeatures = (storeName:string, data:AudioFeatures)=>{
    request = indexedDB.open(dbName,version);

    request.onsuccess= () => {
      console.log("request.onsuccess = addAudioFeatures");
      db = request.result;
      const transaction = db.transaction(storeName,'readwrite');
      const store = transaction.objectStore(storeName);
      store.add(data);
    };

    request.onerror = () =>{
      const error = request.error?.message;

      if(error){
        console.log("There has been an error adding new audio features");
        console.log(error);
      }
      else {
        console.log("Unknown error has occured while adding audio features");
      }
    }
  }

  export const getAudioFeatures = (storeName:string,key:string):Promise<AudioFeatures|null>=>{
    return new Promise((resolve)=>{
      request = indexedDB.open(dbName);

      request.onsuccess = () => {
        console.log('request onsuccess - getAudioFeatures')
        db = request.result;

        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const res = store.get(key);

        res.onsuccess = ()=> {
          resolve(res.result);
        }

        res.onerror = () => {
          console.log("getAudioFeatures");
          resolve(null);
        }
      }
    })
  }