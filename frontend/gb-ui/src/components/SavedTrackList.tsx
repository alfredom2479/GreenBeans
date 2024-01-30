import {useState, useEffect} from "react"
import { redirect, useLoaderData, useParams, NavLink } from "react-router-dom";
import TrackCard from "./TrackCard";
import { requestSavedTracks } from "../api";

import type {Params} from "react-router-dom";

import { ITrack } from "../interfaces";

interface URLParams{
  params:Params
}

export async function loader({params}:URLParams){

  const accessToken:string|null = localStorage.getItem("access_token");
  if(!accessToken || accessToken === ""){
    return redirect('/link-search');
  }

  let pageNumber:number = 0;

  if(typeof params.page === "string"){
    
    pageNumber = Number(params.page);

    if(pageNumber < 0){
      pageNumber = 0
    }
  }
  console.log(pageNumber);
  try{
    const data = await requestSavedTracks(pageNumber,50,accessToken);
    console.log(data)
    
    if(data && data.items && Array.isArray(data.items)){
      console.log("made it to if");
      if(data.items.length === 0){
        if(pageNumber !== 0 ){
          return redirect("/saved/0")
        }
        return redirect("/link-search");
      }
      return data.items;
    }
    else{
      return [];
    }
  }catch(err){
    console.log("Thre has been an error while loading the saved tracks data");
    console.log(err);
  }
}

export default function SavedTrackList(){

  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewUrl, setModalSongPreviewUrl] = useState<string>("");

  const [savedTracksList, setSavedTracksList] = useState<ITrack[]>([])

  const loaderData = useLoaderData();

  const {page} = useParams();
  let pageNumber:number = 0;
  let nextPageNumber:number = 0;
  let prevPageNumber:number =0;

  if(typeof page === "string" ){
    pageNumber =Number(page)
    
    if(pageNumber < 0){
      pageNumber = 0;
    }

    if(pageNumber !== 0){
      prevPageNumber = pageNumber -1;
    }
      nextPageNumber = pageNumber +1;

  }

  useEffect(()=>{
    if(Array.isArray(loaderData)){

      const tempTrackList:ITrack[] = [];
      
      for(let i=0; i < loaderData.length;i++){
        //console.log(loaderData[i]);
        const tempTrackInfo:ITrack = {id:"", name:"",artist:"",image:""};

        if(!loaderData[i].track){
          continue;
        }
        if(loaderData[i].track.id){
          tempTrackInfo.id = loaderData[i].track.id;
        }
        if(loaderData[i].track.name){
          tempTrackInfo.name = loaderData[i].track.name
        }
        if(loaderData[i].track.artists){
          if(Array.isArray(loaderData[i].track.artists) && loaderData[i].track.artists.length > 0){
            tempTrackInfo.artist = loaderData[i].track.artists[0].name;
          }
        }
        if(loaderData[i].track.album && loaderData[i].track.album.images){
          if(Array.isArray(loaderData[i].track.album.images) && 
            loaderData[i].track.album.images.length > 0){
              tempTrackInfo.image = loaderData[i].track.album.images[loaderData[i].track.album.images.length-1].url;
            }
        }
        if(loaderData[i].track.preview_url){
          tempTrackInfo.url = loaderData[i].track.preview_url;
        }
        else if(loaderData[i].track.external_urls && loaderData[i].track.external_urls.spotify){
          tempTrackInfo.url = loaderData[i].track.external_urls.spotify;
        }
        tempTrackList.push(tempTrackInfo);
      }
      setSavedTracksList(tempTrackList);
    }
  },[loaderData]);

  function handleListenOnClick(songPreviewUrl:string|undefined){
    if(songPreviewUrl === undefined){
      console.log("Song preview url is undefined");
      return;
    }
    setModalSongPreviewUrl(songPreviewUrl);
    setShowModal(true);
    return;
  }

  return(
  <>
  <div className="flex">
        <NavLink 
          to={`/saved/${prevPageNumber}`}
          className="flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold p-1  text-center border-white border-2 border-l-0 hover:border-purple-600"
          >prev
        </NavLink>
        <NavLink 
          to={`/saved/${nextPageNumber}`}
          className="flex-1 items-center justify-center bg-stone-900 hover:text-purple-600 text-purple-200 text-xl font-bold p-1  text-center border-white border-2 border-r-0 border-l-2 hover:border-purple-600"
          >next
        </NavLink>
            </div>
    <div className=" overflow-y-scroll">
      <ul>
        {savedTracksList.map((track)=>{
          return (
            <li key={track.id}>
              <TrackCard
                id={track.id}
                name={track.name}
                artist={track.artist}
                image={track.image}
                url={track.url}
                popModal={handleListenOnClick}
                />
            </li>
            
          )
        })}
      </ul>
    </div>
{showModal ?
      <div className="z-10 fixed h-full w-full left-0 top-0 pt-48 bg-[rgba(0,0,0,.4)]"
      onClick={()=>{setShowModal(false)}}>
        <div className="bg-gray-50 m-auto w-10/12 flex justify-center">
          <iframe className="m-2" src={modalSongPreviewUrl}/>
        </div>
    
      </div>
      :
      null
    }
    </>
  )

}