import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import AuthPage, {loader as tokensLoader} from "./pages/AuthPage";
import TopPage from "./pages/TopPage"
import TopOf, {loader as topDataLoader} from './components/TopOf';
import TrackPage,{loader as trackDataLoader} from './pages/TrackPage';
import {action as getRecsAction} from './components/RecOptionsSection';
import SavedPage from './pages/SavedPage';
import SavedTrackList,{loader as savedTracksLoader} from './components/SavedTrackList';
import LinkSearchPage, {action as searchLinkAction} from './pages/LinkSearchPage';
import NavBar, {loader as loggedInCheckerLoader} from './components/NavBar';

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar/>,
    loader: loggedInCheckerLoader,
    errorElement: <h1>Error. Try reloading.</h1>,
    children: [
      {
        path:"/",
        element: <div className='text-white text-2xl'><h1>This is home page</h1><h2>under construction</h2></div>
      },
      {
        path: "/auth",
        element: <AuthPage/>,
        loader: tokensLoader
      },
      {
        path: "top",
        element: <TopPage/>,
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
        path: "link-search",
        element: <LinkSearchPage/>,
        action:searchLinkAction
      },
      {
        path: "/track",
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
