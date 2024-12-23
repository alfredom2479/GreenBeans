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
        //'url' in value &&
        //typeof value.url === 'string' &&
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
        console.error('History request made by non-user');
        loggedInUserMadeRequest = false;
        //return;
    }
    if(!isTrack(track)){
        console.error('Invalid track object received');
        return;
    }
    //some valid tracks dont have preview urls
    if(!track.url){
        track.url = "";
    }

    if(!isAudioFeatures(audioFeatures)){
        console.error('Invalid audio features object received');
        return;
    }


    if (loggedInUserMadeRequest){
        // Check if user exists in database
        const existingUser:User|null = await checkUserExists(user.id);
        console.log("existingUser: ", existingUser);
        if (existingUser === null) {
            //check if user access token belongs toan actual spotify user
            try{
                const response = await getSpotifyUser(user.access_token);
                //check if spotify access token's user id matches the id of user object
                if (!response || !response.id || response.id !== user.id) {
                    //if not, yurr done (someone is up to no good )
                    console.log("user access token does not belong to a spotify user");
                    return;
                }
            //if user ids match, add the user to the database
            const userWasCreated:boolean = await createUser(user.id, user.displayName, user.access_token);
            if(!userWasCreated){
                console.log("user was not created");

                return;
            }
            }catch(err){
                console.error("Error getting spotify user: "+err);
                return;
            }
        }
        else{
            // compare access token from request with access token from database
            const dbAccessToken = existingUser.access_token;
            if (dbAccessToken !== user.access_token) {
                //if access tokens don't match, check if access token belongs to claimed spotify user
                try{
                    const response = await getSpotifyUser(user.access_token);
                    if (!response || !response.id  || response.id !== user.id) {
                        console.log("response: ", response);
                        console.log("history was not updated (bad response from spotify)",track.id);
                        return;
                    }
                    //if access token belongs to claimed spotify user, update the access token in the database
                    await updateUserAccessToken(user.id, user.access_token);
                }catch(err){
                    console.error("Error updating user access token: "+err);
                    console.log("history was not updated (axios or update error)",track.id);
                    return;
                }
            }
        }

    }

    try{
        const finalResult:boolean = await storeTrackAndHistory(track,loggedInUserMadeRequest ? user : null, audioFeatures);
        console.log("was history updated? for track: ", track.id, finalResult);
    }catch(err){
        console.error("Error storing track and history: "+err);
        console.log("history was not updated",track.id);
        return;
    }
    
})

const getSpotifyUser = async (accessToken:string) => {
    try{
        const response:AxiosResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        //console.log("response: ", response.data);
        return response.data;
    }catch(err){
        console.log("Error getting spotify user: "+err);
        return null;
    }
}

export {testDatabase,storeTrack};

