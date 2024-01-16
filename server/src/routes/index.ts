import express, { 
  Application,
} from 'express';

import authRoutes from "./authRoutes.js";
import spotifyRoutes from "./spotifyRoutes.js"

const constructorMethod = (app:Application) =>{
    
    app.use("/api/auth", authRoutes);
    app.use("/api/spotify",spotifyRoutes);

    console.log('this should run');
    app.use("*", (req,res)=>{res.send("<h1>Welcome Home</h1>")});
}

export default constructorMethod;