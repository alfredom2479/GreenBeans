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
  image: string[]
  url?: string,
  spotify_url?:string,
  trackSaveState: TrackSaveState
}

export interface SongPreviewInfo{
  name: string,
  artist: string,
  url: string,
  image: string
}

export interface AudioFeatures{
  id:string,
  acousticness?: number,
  danceability?: number,
  energy?: number,
  valence?: number,
  tempo?: number,
  duration_ms?: number,
  key?: number,
  mode?: number
}

export const audioFeatureNames: (keyof AudioFeatures)[] = [
    'acousticness' ,
    'danceability' ,
    'energy' ,
    'valence' ,
    'tempo',
    'duration_ms',
    'key',
    'mode'
  ]

export interface AudioFeatureSettings  {
  id: string,
  acousticness: number,
  danceability: number,
  energy: number,
  valence: number,
  tempo: number,
  key: number,
  mode: boolean,
  duration_ms: number,
  popularity: number
}


export type ListenOnClickContextType = {
  handleListenOnClick:(songPreviewInfo:SongPreviewInfo|undefined) =>void
}

export function useHandleListenOnClick(){
  return useOutletContext<ListenOnClickContextType>();
}

export function useTrackAndAudioFeatures(){
  return useOutletContext<{currAudioFeatures:AudioFeatures, trackData:ITrack}>();
}

