import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import HomePage, {action as requestAction} from "./pages/HomePage";
import TopPage, {loader as tokensLoader} from "./pages/TopPage";
import RealTopPage,{loader as spotifyDataLoader} from "./pages/RealTopPage"
import TopOf, {loader as topDataLoader} from './assets/TopOf';


const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage/>,
    action:  requestAction
  },
  {
    path: "/top",
    element: <TopPage/>,
    loader: tokensLoader,
    errorElement: <h1> The developer is dumb, please try again</h1>
  },
  {
    path: "/real-top",
    element: <RealTopPage/>,
    loader: spotifyDataLoader,
    children: [
      {
        path: ":range",
        element: <TopOf/>,
        loader: topDataLoader
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
