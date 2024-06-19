import { AudioFeatures, ITrack } from "./interfaces";

//let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 4;
const dbName = "greenbeansDB";

export enum Stores {
  Tracks = 'tracks',
  AudioFeatures = 'audio_features',
  TrackLists = 'track_lists',
  LastUpdated = 'last_updated'
}

export const openIDB = ()=>{
  const request = indexedDB.open(dbName,version);

  request.onupgradeneeded = () => {
    console.log("openIDB - upgrade needed");
    db = request.result;

    if(!db.objectStoreNames.contains(Stores.Tracks)){
      console.log("creating tracks store...");
      db.createObjectStore(Stores.Tracks, {keyPath: 'id'});
    }

    if(!db.objectStoreNames.contains(Stores.AudioFeatures)){
      console.log("creating audio features store...");
      db.createObjectStore(Stores.AudioFeatures,{keyPath:'id'});
    }

    if(!db.objectStoreNames.contains(Stores.TrackLists)){
      console.log("creating Track Lists store...");
      //dont forget to specify the key
      db.createObjectStore(Stores.TrackLists);
    }
    if(!db.objectStoreNames.contains(Stores.LastUpdated)){
      console.log("creating Last Updated store...");
      db.createObjectStore(Stores.LastUpdated);
    }
  }

  request.onsuccess = () => {
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
  const request = indexedDB.open(dbName,version);

  request.onsuccess = () =>{
    //console.log("request.onsuccess - addITrack",data);
    db = request.result;
    const transaction = db.transaction(storeName,'readwrite');
    const store = transaction.objectStore(storeName);
    store.add(data);
  };

  request.onerror = () => {
    const error = request.error?.message;

    if(error){
      console.log("addITrack error - "+error);
    }
    else{
      console.log("addITrack - Unknown Error has occured");
     }
  };
}


export const updateITrack = (storeName:string, data:ITrack)=>{

  const request = indexedDB.open(dbName, version);

  request.onsuccess = ()=>{
    //console.log('onsuccess - update data', key);
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
    
  };
  request.onerror = () => {
    const error = request.error?.message;

    if(error){
      console.log("updateITrack error - "+error);
    }
    else{
      console.log("updateITrack - Unknown Error has occured");
     }
  };
}

export const getITrack= (storeName:string,key:string):Promise<ITrack|null>=>{
  return new Promise((resolve)=>{

    const request = indexedDB.open(dbName);

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
    const request = indexedDB.open(dbName,version);

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
      const request = indexedDB.open(dbName);

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
          console.log("getAudioFeatures error ");
          resolve(null);
        }
      }
    })
  }


export const addTrackList = (storeName:string,trackList: ITrack[],key:string)=>{
  //console.log(trackList);
  const request= indexedDB.open(dbName,version);

  const idList:string[] = [];

  request.onsuccess = () =>{
    console.log("request.onsucess - addTrackLIst");
    db = request.result;
    const transaction = db.transaction(storeName,'readwrite');
    const store = transaction.objectStore(storeName);

    for(let i=0; i < trackList.length; i++){
      addITrack(Stores.Tracks,trackList[i]);
      idList.push(trackList[i].id);
    }
    //u have to specify key
    store.put(idList,key);
  };

  request.onerror = () =>{
    const error = request.error?.message;

    if(error){
      console.log(error);
    }
    else{
      console.log("Unknown error has occured");
    }
  }
}

export const getTrackList = async (storeName:string, key:string):Promise<ITrack[]|null>=>{
  return new Promise((resolve)=>{
    
    const request = indexedDB.open(dbName);

    request.onsuccess = () => {
      console.log("request onsuccess = getTrackList");
      db = request.result;
      
      const transaction = db.transaction(storeName,'readonly');
      const store = transaction.objectStore(storeName);
      const res = store.get(key);

      res.onsuccess = async () => {
        console.log(res.result);
        
        if(res.result === null || res.result === undefined){
          resolve(null);
          return;
        }
        
        const trackIdList = res.result;
        const resultTrackList:ITrack[] = [] ;

        for(let i = 0; i <trackIdList.length;i++){
          const trackObject = await getITrack(Stores.Tracks,trackIdList[i]);
          if(trackObject !== null && trackObject !== undefined){
            resultTrackList.push(trackObject)
          }
          else{
            resolve(null);
            return;
          }
        }

        resolve(resultTrackList);
        return;
      }

      res.onerror = () => {
        console.log("get track list error");
        resolve(null);
      }
    }
  })
}

export const addLastUpdatedTime = (storeName:string,timeSaved:number, key:string)=>{
  const request = indexedDB.open(dbName,version);
  console.log("in addLastUpdatedTime idb function");
  request.onsuccess = () => {
    console.log("addLastUpdatedTime onsuccess");
    db = request.result;
    const transaction = db.transaction(storeName,'readwrite');
    const store = transaction.objectStore(storeName);
    store.put(timeSaved,key);
  }

  request.onerror = () => {
    const error = request.error?.message;

    if(error){
      console.log("There has been an error adding new last_updated_time: "+key+" -> "+timeSaved);
      console.log(error)
    }
    else{
      console.log("Unknown error has occured while adding last updated time: "+key+" -> "+timeSaved);
    }
  }
}

export const getLastUpdatedTime = (storeName:string,key:string):Promise<number|null> =>{
  return new Promise((resolve)=>{
    const request = indexedDB.open(dbName);

    request.onsuccess = () =>{
      console.log('request onsuccess = getAudioFeatures');
      db = request.result;

      const transaction = db.transaction(storeName,'readonly');
      const store = transaction.objectStore(storeName);
      const res = store.get(key);

      res.onsuccess = () =>{
        if(res.result === null || res.result === undefined){
          resolve(null);
          return;
        }
        else{
          resolve(res.result)
          return;
        }
      }

      res.onerror = () =>{
        console.log("getLastUpdatedTime error");
        resolve(null);
      }
    }
  })
}

export const deleteAllStores = async ()=>{
  console.log("delete all stores is running");
  const request = indexedDB.open(dbName,version);

  request.onsuccess= () =>{
    db = request.result;
    const transaction = db.transaction(db.objectStoreNames,'readwrite');

    transaction.onerror = (event) =>{
      console.log("Transaction error!");
      console.log(event);
    }
    transaction.oncomplete = ()=>{
      console.log("All stores have been deleted");
    }

    console.log(db.objectStoreNames);
    for(const storeName of db.objectStoreNames){
      console.log("store name:"+storeName);
      const objectStore = transaction.objectStore(storeName);
      const clearReq = objectStore.clear();

      clearReq.onerror = (event) =>{
        console.log("error clearing "+ storeName)
        console.log(event);
      }
      clearReq.onsuccess = () =>{
        console.log(storeName+" cleered succesfully");
      }

    }

  }

  request.onerror = () =>{
    const error = request.error?.message;

    if(error){
      console.log(error);
    }
    else {
      console.log("Unknown error has occured");
    }
  }
}