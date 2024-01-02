
export interface ITrack{
  id: string,
  name: string,
  artist: string,
  image: string
  url?: string,
  isRec?:boolean
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
/*
acousticness": 0.00242,
  "analysis_url": "https://api.spotify.com/v1/audio-analysis/2takcwOaAZWiXQijPHIx7B",
  "danceability": 0.585,
  "duration_ms": 237040,
  "energy": 0.842,
  "id": "2takcwOaAZWiXQijPHIx7B",
  "instrumentalness": 0.00686,
  "key": 9,
  "liveness": 0.0866,
  "loudness": -5.883,
  "mode": 0,
  "speechiness": 0.0556,
  "tempo": 118.211,
  "time_signature": 4,
  "track_href": "https://api.spotify.com/v1/tracks/2takcwOaAZWiXQijPHIx7B",
  "type": "audio_features",
  "uri": "spotify:track:2takcwOaAZWiXQijPHIx7B",
  "valence": 0.428
*/