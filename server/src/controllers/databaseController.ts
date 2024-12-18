import {
    Request,
    Response,
    request
} from "express";
import axios from "axios";
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

    res.status(200).json({message:"history updating...maybe?"});

    let loggedInUserMadeRequest = true;
    //refactor this so that loggedInUser decides the flow of this logic

    const {user,track, audioFeatures} = req.body;
    console.log(req.body);
    console.log(user);
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
        const existingUser = await checkUserExists(user.id);

        if (existingUser === null) {
            //check if user access token belongs toan actual spotify user
            const response = await getSpotifyUser(user.access_token);
            console.log("response: ");
            console.log(response);
            //check if spotify access token's user id matches the id of user object
            if (!response || response.id === undefined || response.id !== user.id) {
                //if not, yurr done (someone is up to no good )
                return;
            }
            //if user ids match, add the user to the database
            await createUser(user.id, user.displayName, user.access_token);
        }
        else{
            // compare access token from request with access token from database
            const dbAccessToken = existingUser.access_token;
            if (dbAccessToken !== user.access_token) {
                //if access tokens don't match, check if access token belongs to claimed spotify user
                const response = await getSpotifyUser(user.access_token);
                if (!response || response.id === undefined || response.id !== user.id) {
                    return;
                }
                //if access token belongs to claimed spotify user, update the access token in the database
                updateUserAccessToken(user.id, user.access_token);
            }
        }

    }

    const finalResult = await storeTrackAndHistory(track,loggedInUserMadeRequest ? user : null, audioFeatures);
    console.log("finalResult: "+finalResult);
    
})

const getSpotifyUser = async (accessToken:string) => {
    try{
        const response = await axios.get('https://api.spotify.com/v1/me', {
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

