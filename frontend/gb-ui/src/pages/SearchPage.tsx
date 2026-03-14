import { useRef, useEffect, useState } from "react";
import { useActionData, Form } from "react-router-dom";
import { requestSpotifySearch } from "../api";
import { ITrack, SongPreviewInfo, TrackSaveState } from "../interfaces";
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
        console.log(searchInput);
        console.log(err);
        return "track not found"+searchInput;
    }
}


export default function SearchPage(){

    const [searchResultsLoading,setSearchResultsLoading] = useState(false);
    const [searchResults,setSearchResults] = useState<ITrack[]>([]);
    const [showModal,setShowModal] = useState(false);
    const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:"",image:""});
    const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
    const [modalTrackList, setModalTrackList] = useState<ITrack[]>([]);

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

    function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined, index?: number, trackList?: ITrack[]){
        if(songPreviewInfo === undefined){
            return;
        }
        setModalSongPreviewInfo(songPreviewInfo);
        if (searchResults.length > 0 && index !== undefined && trackList?.length) {
            setModalTrackList(trackList);
            setModalCurrentIndex(index);
        } else {
            setModalTrackList([]);
            setModalCurrentIndex(0);
        }
        setShowModal(true);
    }

    return (
        <div className="min-h-[calc(100%-3.5rem)] w-full flex flex-col">
            {/* Search hero */}
            <section className="shrink-0 px-4 sm:px-6 pt-6 sm:pt-10 pb-8">
                <div className="mx-auto max-w-2xl">
                    <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                        GreenBeans
                    </h1>
                    <p className="text-center text-zinc-400 text-base sm:text-lg mt-2 sm:mt-3">
                        Find a song you enjoy
                    </p>
                    <Form
                        method="post"
                        onSubmit={() => setSearchResultsLoading(true)}
                        className="mt-6 sm:mt-8 flex flex-col gap-4"
                    >
                        <label htmlFor="search-query" className="sr-only">
                            Search for a song
                        </label>
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                id="search-query"
                                type="text"
                                required
                                maxLength={100}
                                name="search-query"
                                placeholder="Song name or artist..."
                                className="w-full h-12 sm:h-14 pl-4 pr-12 sm:pr-14 text-base sm:text-lg text-white placeholder-zinc-500 bg-zinc-800/80 border border-zinc-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-shadow"
                                aria-describedby="search-hint"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" aria-hidden>
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                        </div>
                        <p id="search-hint" className="text-zinc-500 text-sm text-center sm:text-left">
                            Search by track or artist name
                        </p>
                        <button
                            type="submit"
                            disabled={searchResultsLoading}
                            className="w-full sm:w-auto sm:min-w-[10rem] h-12 px-6 font-semibold text-base rounded-xl bg-green-600 hover:bg-green-500 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#171717] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 transition-colors"
                        >
                            {searchResultsLoading ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Searching…
                                </span>
                            ) : (
                                "Search"
                            )}
                        </button>
                    </Form>
                </div>
            </section>

            {/* Results */}
            <section className="flex-1 min-h-0 px-4 sm:px-6 pb-6" aria-label="Search results">
                <div className="mx-auto max-w-2xl h-full rounded-xl overflow-hidden bg-zinc-900/30 border border-zinc-800/50">
                    {searchResultsLoading ? (
                        <div className="h-48 sm:h-56 flex flex-col items-center justify-center gap-4 text-zinc-400">
                            <svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-sm sm:text-base">Finding tracks…</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="h-48 sm:h-56 flex flex-col items-center justify-center gap-2 px-4 text-center">
                            <p className="text-zinc-500 text-sm sm:text-base">
                                Your search results will appear here
                            </p>
                            <p className="text-zinc-600 text-xs sm:text-sm">
                                Enter a song or artist name above to get started
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-zinc-800/80 overflow-y-auto max-h-[50vh] sm:max-h-[55vh]">
                            {searchResults.map((track, index) => (
                                <li key={track.id}>
                                    <TrackCard
                                        track={track}
                                        popModal={(info) => handleListenOnClick(info, index, searchResults)}
                                        hideSaveButton={true}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            {showModal && (
                <SongPreviewModal
                    setShowModal={setShowModal}
                    songPreviewInfo={modalSongPreviewInfo}
                    currentIndex={modalCurrentIndex}
                    onIndexChange={setModalCurrentIndex}
                    trackList={modalTrackList.length > 0 ? modalTrackList : undefined}
                    onTrackSaved={(track) => setSearchResults((prev) => prev.map((t) => t.id === track.id ? { ...t, trackSaveState: TrackSaveState.Saved } : t))}
                />
            )}
        </div>
    )
}