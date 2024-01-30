import { useOutletContext } from "react-router-dom"

export interface ITrack{
  id: string,
  name: string,
  artist: string,
  image: string
  url?: string,
  isRec?:boolean
  popModal?(url:string|undefined):void
}

export interface AudioFeatures{
  acousticness?: number,
  danceability?: number,
  energy?: number,
  liveness?: number,
  valence?: number,
  tempo?: number,
  duration_ms?: number,
  time_signature?: number,
  instrumentalness?: number,
  key?: number,
  mode?: number
}

export const audioFeatureNames: (keyof AudioFeatures)[] = [
    'acousticness' ,
    'danceability' ,
    'energy' ,
    'liveness' ,
    'valence' ,
    'tempo',
    'duration_ms',
    'time_signature',
    'instrumentalness',
    'key',
    'mode'
  ]

export type ListenOnClickContextType = {
  handleListenOnClick:(songPreviewUrl:string|undefined) =>void
}

export function useHandleListenOnClick(){
  return useOutletContext<ListenOnClickContextType>();
}