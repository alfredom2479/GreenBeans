import {
    Request,
    Response,
    request
} from "express";
import axios from "axios";
import asyncHandler from "express-async-handler";
import {testDatabaseQuery,checkUserExists,createUser,updateUserAccessToken} from "../db.js";

const testDatabase = asyncHandler(async (req:Request,res:Response)=>{
    testDatabaseQuery();
    res.status(200).json({message:"database test"});
})

const storeTrack = asyncHandler(async (req:Request,res:Response)=>{

    res.status(200).json({message:"history updating...maybe?"});

    const {user,track, audioFeatures} = req.body;
    let loggedInUserMadeRequest = false;

    console.log("user: "+user);

    if (user !== null && user !== undefined){
        loggedInUserMadeRequest = true;
        // Check if user exists in database
        const existingUser = await checkUserExists(user.id);

        if (existingUser === null) {
            //check if user is valid
            const response = await getSpotifyUser(user.access_token);
            console.log("response: "+response);
            if ( response === null || response.data.id !== user.id) {
                return;
            }
            // User doesn't exist, create new user
            await createUser(user.id, user.displayName, user.access_token);
        }
        else{
            // Get access token from database and compare
            const dbAccessToken = existingUser.access_token;
            if (dbAccessToken === user.access_token) {
                console.log('yay');
            } else {
                console.log('nay'); 
                const response = await getSpotifyUser(user.access_token);
                console.log(response);
                if ( response === null || response.data.id !== user.id) {
                    return;
                }
                // Update user's access token in database
                // not a big deal if access token is not updated.
                // Going to have to make spotify request every time user views a track though.
                updateUserAccessToken(user.id, user.access_token);
            }
        }

        //TODO: store track and audio features in database (concurrently in a transaction, if possible)
        //TODO: checking if track and audio features are valid first.
        //TODO: Store user_recent_tracks(if user is logged in) and global_recent_tracks in database 
        //TODO:(in the same transaction as the track and audio features)
    }
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

