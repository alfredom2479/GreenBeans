import { useOutletContext } from "react-router-dom"

export enum TrackSaveState {
  CantSave,
  Saveable,
  Saved
}

export interface ITrack{
  id: string,
  name: string,
  artist: string,
  image: string
  url?: string,
  spotify_url?:string,
  //popModal?(songPreviewInfo:SongPreviewInfo|undefined):void,
  trackSaveState: TrackSaveState
}

export interface SongPreviewInfo{
  name: string,
  artist: string,
  url: string
}

export interface AudioFeatures{
  id:string,
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
  handleListenOnClick:(songPreviewInfo:SongPreviewInfo|undefined) =>void
}

export function useHandleListenOnClick(){
  return useOutletContext<ListenOnClickContextType>();
}

export function useAudioFeatures(){
  return useOutletContext<AudioFeatures>();
}