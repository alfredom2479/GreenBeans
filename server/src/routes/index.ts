import express, { 
  Application,
} from 'express';

import authRoutes from "./authRoutes.js";
import spotifyRoutes from "./spotifyRoutes.js"
import databaseRoutes from "./databaseRoutes.js";
const constructorMethod = (app:Application) =>{

    
    app.use("/api/auth",authRoutes);
    app.use("/api/spotify",spotifyRoutes);
    app.use("/api/history",databaseRoutes);
    app.use("*", (req,res)=>{res.status(400).json({Error: "Bad Request"})});
}

export default constructorMethod;