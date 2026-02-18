import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import configureRoutes from "./routes/index.js";


console.log(process.env.PORT);
const port = process.env.PORT || 6000;
console.log(process.env);
console.log(port);

const app = express();

app.use(cors());
app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

configureRoutes(app);


app.listen(port,()=>console.log(`Server started on port ${port}`));