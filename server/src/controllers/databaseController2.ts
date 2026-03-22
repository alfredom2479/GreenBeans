import { Request, Response } from "express";
import { AxiosResponse } from "axios";
import type { User, Track } from "../db2.js";
import { storeTrack, 
    storeSearch, 
    storeTrackAndSearch,
    hashToken,
    getUserByTokenHash,
    createUser } from "../db2.js";
import axios from "axios";

const getSpotifyUser = async (accessToken:string) => {
    console.log("getSpotifyUser function called");
    try{
        const response:AxiosResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
        return response.data;
    }catch(err){
        console.error("Error getting spotify user: "+err);
        return null;
    }
}

const storeTrackAndSearchToDatabase = async (req: Request, res: Response) => {
    console.log("storeTrackAndSearch function called")
    res.status(200).json({message:"history updating probably"});
    console.log("req.body: ", req.body);
    const {user, track, audioFeatures} = req.body;
// Check if track is a valid Track type
if (
    !track ||
    typeof track !== "object" ||
    typeof track.id !== "string" ||
    typeof track.name !== "string" ||
    typeof track.artist !== "string" ||
    // images can be string[] or null per db2.ts. If not null, should be an array of strings.
    (track.image !== null && (!Array.isArray(track.image) || !track.image.every(img => typeof img === "string")))
) {
    console.error("Invalid track object received");
    return;
}

// Optionally check user type
if (
    !user ||
    typeof user !== "object" ||
    typeof user.id !== "string" ||
    typeof user.displayName !== "string" ||
    typeof user.access_token !== "string"
) {
    console.error("History request made by non-user");
    //storeTrack(track);
    //storeSearch(track.id, null);
    storeTrackAndSearch(track, null);
    return;
}

const accessTokenHash = hashToken(user.access_token);
const dbUser = await getUserByTokenHash(accessTokenHash);
if (!dbUser) {
    //send request to spotify to get user info
    const response = await getSpotifyUser(user.access_token);
    if (!response || !response.id  || response.id !== user.id) {
        console.error("User not found/ user id does not match");
        storeTrackAndSearch(track, null);
        return;
    }
    //create user in database
    const userWasCreated = await createUser(response.id, response.display_name, accessTokenHash);
    if (!userWasCreated) {
        console.error("User not created");
        storeTrackAndSearch(track, null);
        return;
    }
    storeTrackAndSearch(track, response.id);
    return;
}
//insert search using dbUser.id
storeTrackAndSearch(track, dbUser.id);
   return;

}

export {storeTrackAndSearchToDatabase};