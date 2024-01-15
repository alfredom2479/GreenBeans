import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

//import HomePage  from "./pages/HomePage";
import TopPage, {loader as tokensLoader} from "./pages/TopPage";
import RealTopPage,{loader as spotifyDataLoader} from "./pages/RealTopPage"
import TopOf, {loader as topDataLoader} from './components/TopOf';
import TrackPage,{loader as trackDataLoader} from './pages/TrackPage';
import {action as getRecsAction} from './components/RecOptionsSection';
import SavedPage from './pages/SavedPage';
import SavedTrackList,{loader as savedTracksLoader} from './components/SavedTrackList';
import LinkSearchPage, {action as searchLinkAction} from './pages/LinkSearchPage';
import NavBar, {loader as loggedInCheckerLoader} from './components/NavBar';
//import RecsSection, {loader as recsDataLoader} from './components/RecsSecion';


const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar/>,
    loader: loggedInCheckerLoader,
    errorElement: <h1>A big oopsies has occured</h1>,
    children: [
      {
        path:"/",
        element: <div className='text-white text-2xl'><h1>This is home page</h1><h2>under construction</h2></div>
      },
      {
        path: "/top",
        element: <TopPage/>,
        loader: tokensLoader
      },
      {
        path: "real-top",
        element: <RealTopPage/>,
        loader: spotifyDataLoader,
        children: [
          {
            path: ":range",
            element: <TopOf/>,
            loader: topDataLoader
          },
          {
            path:"",
            element: <TopOf/>,
            loader: topDataLoader
          }
        ]
      },
      {
        path: "/saved",
        element:<SavedPage/>,
        children:[
          {
            path: "",
            element: <SavedTrackList/>,
            loader: savedTracksLoader
          },
          {
            path:":page",
            element: <SavedTrackList/>,
            loader: savedTracksLoader
          }
        ]
      },
      {
        path: "*",
        element: <LinkSearchPage/>,
        action:searchLinkAction
      },
      {
        path: "/track",
        //element: <TrackPage/>,
        children: [
        {
          path: ":trackid",
          element: <TrackPage/>,
          loader: trackDataLoader,
          action: getRecsAction,
          shouldRevalidate: ({formMethod}) => {
            return formMethod !== "post"
          }
        }
    ]
  },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
