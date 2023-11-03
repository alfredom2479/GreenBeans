import express, { 
  Application,
} from 'express';

import authRoutes from "./authRoutes.js";

const constructorMethod = (app:Application) =>{
    
    app.use("/api/auth", authRoutes)

    console.log('this should run');
    app.use("*", (req,res)=>{res.send("<h1>Welcome Home</h1>")});
}

export default constructorMethod;