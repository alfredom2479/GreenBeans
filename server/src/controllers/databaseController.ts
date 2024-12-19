import {
    Request,
    Response,
    request
} from "express";
import axios, {AxiosResponse} from "axios";
import asyncHandler from "express-async-handler";
import {testDatabaseQuery,
    checkUserExists,
    createUser,
    updateUserAccessToken,
    storeTrackAndHistory
} from "../db.js";

export interface User{
    id:string;
    displayName:string;
    access_token:string;
}

export interface Track{
    id:string;
    name:string;
    artist:string;
    url:string;
    image:string[];
}

export interface AudioFeatures{
    id:string;
    acousticness:number;
    danceability:number;
    energy:number;
    valence:number;
    tempo:number;
    duration_ms:number;
    key:number;
    mode:number;
}

const isUser = (value: unknown): value is User => {
    return (
        !!value &&
        typeof value === 'object' &&
        'id' in value &&
        typeof value.id === 'string' &&
        'displayName' in value &&
        typeof value.displayName === 'string' &&
        'access_token' in value &&
        typeof value.access_token === 'string'
    )
}
const isTrack = (value: unknown): value is Track => {
    return (
        !!value &&
        typeof value === 'object' &&
        'id' in value &&
        typeof value.id === 'string' &&
        'name' in value &&
        typeof value.name === 'string' &&
        'artist' in value &&
        typeof value.artist === 'string' &&
        'url' in value &&
        typeof value.url === 'string' &&
        'image' in value &&
        Array.isArray(value.image) &&
        value.image.every((image: string) => typeof image === 'string')
    )
}

const isAudioFeatures = (value: unknown): value is AudioFeatures => {
    return (
        !!value &&
        typeof value === 'object' &&
        'id' in value &&
        typeof value.id === 'string' &&
        'acousticness' in value &&
        typeof value.acousticness === 'number' &&
        'danceability' in value &&
        typeof value.danceability === 'number' &&
        'energy' in value &&
        typeof value.energy === 'number' &&
        'valence' in value &&
        typeof value.valence === 'number' &&
        'tempo' in value &&
        typeof value.tempo === 'number' &&
        'duration_ms' in value &&
        typeof value.duration_ms === 'number' &&
        'key' in value &&
        typeof value.key === 'number' &&
        'mode' in value &&
        typeof value.mode === 'number'
    )
}   

const testDatabase = asyncHandler(async (req:Request,res:Response)=>{
    testDatabaseQuery();
    res.status(200).json({message:"database test"});
})


const storeTrack = asyncHandler(async (req:Request,res:Response)=>{
    //This function sends response early because history doesnt HAVE to be updated
    //every return is indicative of a fail state that does not have to be
    //dealt with

    res.status(200).json({message:"history updating...maybe?"});

    let loggedInUserMadeRequest:boolean = true;
    //refactor this so that loggedInUser decides the flow of this logic

    const {user,track, audioFeatures} = req.body;
    if(!isUser(user)){
        console.error('Invalid user object received');
        loggedInUserMadeRequest = false;
        //return;
    }
    if(!isTrack(track)){
        console.error('Invalid track object received');
        return;
    }
    if(!isAudioFeatures(audioFeatures)){
        console.error('Invalid audio features object received');
        return;
    }


    if (loggedInUserMadeRequest){
        // Check if user exists in database
        const existingUser:User|null = await checkUserExists(user.id);

        if (existingUser === null) {
            //check if user access token belongs toan actual spotify user
            const response:AxiosResponse|null = await getSpotifyUser(user.access_token);
            //check if spotify access token's user id matches the id of user object
            if (!response || !response.data || response.data.id === undefined || response.data.id !== user.id) {
                //if not, yurr done (someone is up to no good )
                return;
            }
            //if user ids match, add the user to the database
            try{
                await createUser(user.id, user.displayName, user.access_token);
            }catch(err){
                console.error("Error creating user: "+err);
                return;
            }
        }
        else{
            // compare access token from request with access token from database
            const dbAccessToken = existingUser.access_token;
            if (dbAccessToken !== user.access_token) {
                //if access tokens don't match, check if access token belongs to claimed spotify user
                const response:AxiosResponse|null = await getSpotifyUser(user.access_token);
                if (!response || !response.data || response.data.id === undefined || response.data.id !== user.id) {
                    return;
                }
                //if access token belongs to claimed spotify user, update the access token in the database
                updateUserAccessToken(user.id, user.access_token);
            }
        }

    }

    const finalResult:boolean = await storeTrackAndHistory(track,loggedInUserMadeRequest ? user : null, audioFeatures);
    console.log("was history updated? for user and track: ",user.id, track.id, finalResult);
    
})

const getSpotifyUser = async (accessToken:string):Promise<AxiosResponse|null> => {
    try{
        const response:AxiosResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }catch(err){
        console.log("Error getting spotify user: "+err);
        return null;
    }
}

export {testDatabase,storeTrack};

