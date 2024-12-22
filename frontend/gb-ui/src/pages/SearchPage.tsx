import { useRef, useEffect, useState } from "react";
import { useActionData, Form } from "react-router-dom";
import { requestSpotifySearch } from "../api";
import { ITrack, SongPreviewInfo } from "../interfaces";
import { isTrack, isITrackObject } from "../utils";
import TrackCard from "../components/TrackCard";
import SongPreviewModal from "../components/modals/SongPreviewModal";

export async function action({request}:{request:Request}){

    let isLoggedIn = true;

    let access_token:string|null = localStorage.getItem("access_token");
    if(!access_token || access_token === ""){
        isLoggedIn = false;
        access_token = "";
    }

    const formData = await request.formData();
    const searchInput = formData.get("search-query");

    if(searchInput === null || typeof searchInput !== "string"){
        console.log("search input is null or not a string");
        return "track not found"+searchInput;
    }

    try{
        const data = await requestSpotifySearch(access_token,searchInput,isLoggedIn);
        if(!data || data === undefined){
            console.log("data is null or undefined");
            return "track not found"+searchInput;
        }
        //return redirect(`/track/${data.id}`);
        //console.log(data);

        if(!data || typeof data !== "object" || !("tracks" in data) || typeof data.tracks !== "object"
        || data.tracks === null || !("items" in data.tracks) || !Array.isArray(data.tracks.items)){
            //console.log("data is not who we though she was");
            return "track not found"+searchInput;
        }

        const tempTrackList:ITrack[] = [];
        let possibleTrack: ITrack|null = null;

        for(let i=0; i < data.tracks.items.length; i++){
            //console.log(data.tracks.items[i]);
            possibleTrack = isTrack(data.tracks.items[i]);
            if(possibleTrack !== null){
                tempTrackList.push(possibleTrack);
            }
        }
        //console.log("tempTrackList",tempTrackList);
        return tempTrackList;
    }catch(err){
        console.log("error in requestSpotifySearch");
        return "track not found"+searchInput;
    }
}


export default function SearchPage(){

    const [searchResultsLoading,setSearchResultsLoading] = useState(false);
    const [searchResults,setSearchResults] = useState<ITrack[]>([]);
    const [showModal,setShowModal] = useState(false);
    const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:"",image:""});

    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const actionData = useActionData();


    useEffect(()=>{
        //console.log("actionData",actionData);
        //console.log("in useEffect");

        if(actionData && Array.isArray(actionData)){
            //console.log("actionData is an array");
            const tempTrackList:ITrack[] = [];
            let possibleTrack: ITrack|null = null;

            for(let i=0; i < actionData.length; i++){
                possibleTrack = isITrackObject(actionData[i]);
                //console.log("possibleTrack",possibleTrack);
                if(possibleTrack !== null){
                    tempTrackList.push(possibleTrack);
                }
            }
            setSearchResultsLoading(false);
            setSearchResults(tempTrackList);
        }
        else{
            //setSearchResultsLoading(false);
            setSearchResults([]);
        }
        //console.log("searchResults",searchResults);
        //console.log("in useEffect 2");
    },[actionData])

    function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined){
        if(songPreviewInfo === undefined){
            return;
        }
        setModalSongPreviewInfo(songPreviewInfo);
        setShowModal(true);
        return;
    }

    return (

        <div className=" h-[calc(100%-3.5rem)] w-full flex flex-col ">
            <div className="flex flex-col  w-full justify-start ">
                <div className=" text-center lg:text-7xl text-5xl text-green-600 my-5 ">GreenBeans</div>
                <Form 
                method='post' 
                onSubmit={()=>{setSearchResultsLoading(true)}}
                    className=' flex flex-col justify-between items-center w-full '>
                    <label htmlFor="spotify-link" className="text-xl text-green-50 pb-2">Search for a song you enjoy:</label>
                    <input ref={searchInputRef} type="text" required maxLength={100} name="search-query" placeholder="Hot To Go Chappell Roan"
                    className="text-xl h-10 w-10/12 px-1 rounded-xl"/>
                    <button 
                    //onClick={()=>{setSearchResultsLoading(true)}}
                    disabled={searchResultsLoading}
                    type='submit' 
                    className={`w-40 h-12 mt-2 font-bold text-xl rounded-lg hover:shadow-2xl 
                     ${searchResultsLoading 
                        ? "bg-green-100 cursor-not-allowed" 
                        : "bg-green-200 hover:bg-green-500"}`}>
                        Search
                    </button>
                </Form>
            </div>
            <div className="text-center lg:text-2xl text-xl text-stone-100 p-2">Search Results:</div>
            <div className="h-full border-stone-100  rounded-lg overflow-y-scroll mx-2">
                {searchResultsLoading ? <p className="text-stone-100 text-xl h-full w-full flex justify-center items-center">Loading...</p> :
                <ul>
                        {searchResults.map((track)=>{
                            //console.log("track id",track.id);
                            return <li key={track.id}><TrackCard 
                            track={track} 
                            popModal={handleListenOnClick} 
                            hideSaveButton={true}
                            /></li>
                        })}
                </ul>
                }
            </div>
            {
                showModal 
                ? 
                    <SongPreviewModal
                        setShowModal={setShowModal}
                        songPreviewInfo={modalSongPreviewInfo}
                    />
                :
                    null
            }
        </div>
    )
}