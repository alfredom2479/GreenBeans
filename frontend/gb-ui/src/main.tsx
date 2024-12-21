import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import AuthPage, {loader as tokensLoader} from "./pages/AuthPage";
import TopPage from "./pages/TopPage"
import TopOf, {loader as topDataLoader} from './components/lists/TopOf';
import TrackPage,{loader as trackDataLoader} from './pages/TrackPage';
import {action as getRecsAction} from './components/feature-settings/RecOptionsSection';
import SavedPage,{loader as savedPageLoader} from './pages/SavedPage';
import SavedTrackList,{loader as savedTracksLoader} from './components/lists/SavedTrackList';
import LinkSearchPage, {action as searchLinkAction} from './pages/LinkSearchPage';
import MainLayout, {loader as loggedInCheckerLoader} from './components/layouts/MainLayout';
import RootErrorBoundary from './components/error-components/RootErrorBoundary';
import RecSection, {loader as preRecLoader} from './components/RecSection';
import SearchPage, {action as searchAction} from './pages/SearchPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    loader: loggedInCheckerLoader,
    errorElement: <RootErrorBoundary/>,
    children: [
{
        path: "/",
        element: <SearchPage/>,
        action:searchAction,
        errorElement: <RootErrorBoundary/>
      },
      {
        path:"/link",
        element: <LinkSearchPage/>,
        action:searchLinkAction,
        errorElement: <RootErrorBoundary/>
        
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
      
      // {
      //   path: "link-search",
      //   element: <LinkSearchPage/>,
      //   action:searchLinkAction,
      //   errorElement: <RootErrorBoundary/>
      // },
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
              loader: preRecLoader,
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
