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
import SavedPage,{loader as savedPageLoader} from './pages/SavedPage';
import SavedTrackList,{loader as savedTracksLoader} from './components/SavedTrackList';
import LinkSearchPage, {action as searchLinkAction} from './pages/LinkSearchPage';
import NavBar, {loader as loggedInCheckerLoader} from './components/NavBar';
import RootErrorBoundary from './components/error-components/RootErrorBoundary';
import RecSection,{loader as recLoader} from './components/RecSection';

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar/>,
    loader: loggedInCheckerLoader,
    errorElement: <RootErrorBoundary/>,
    children: [
      {
        path:"/",
        element: <LinkSearchPage/>,
        action:searchLinkAction,
        errorElement: <RootErrorBoundary/>
        //element: <div className='text-white text-2xl'><h1>This is home page</h1><h2>under construction</h2></div>,
        //errorElement: <RootErrorBoundary/>
      },
      {
        path: "/auth",
        element: <AuthPage/>,
        loader: tokensLoader
      },
      {
        path: "top",
        element: <TopPage/>,
        errorElement:<RootErrorBoundary/>,
        children: [
          {
            path: ":range",
            element: <TopOf/>,
            loader: topDataLoader,
            errorElement: <RootErrorBoundary/>
          },
          {
            path:"",
            element: <TopOf/>,
            loader: topDataLoader,
            errorElement: <RootErrorBoundary/>
          }
        ]
      },
      {
        path: "/saved",
        element:<SavedPage/>,
        loader: savedPageLoader,
        children:[
          {
            path:":page",
            element: <SavedTrackList/>,
            loader: savedTracksLoader,
            errorElement: <RootErrorBoundary/>
          }
        ]
      },
      {
        path: "link-search",
        element: <LinkSearchPage/>,
        action:searchLinkAction,
        errorElement: <RootErrorBoundary/>
      },
      {
        path: "/track",
        errorElement: <RootErrorBoundary/>,
        children: [
        {
          path: ":trackid",
          element: <TrackPage/>,
          errorElement: <RootErrorBoundary/>,
          loader: trackDataLoader,
          action: getRecsAction,
          
          children:[
            {
              path: "",
              element: <RecSection/>,
              loader:recLoader,
              action:getRecsAction,
              shouldRevalidate: ({formMethod}) => {
                return formMethod !== "post"
              }
            }
          ]
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
