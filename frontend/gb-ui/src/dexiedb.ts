import Dexie, {type Table} from 'dexie';
import { ITrack } from './interfaces';
import { AudioFeatures } from './interfaces';

const didb = new Dexie('greenbeansIDB') as Dexie & {
    tracks: Table<ITrack,string>;
    audio_features: Table<AudioFeatures,string>;
    track_lists: Table<string[],string>;
    last_updated: Table<number,string>;
};

didb.version(3).stores({
  tracks:'id',
  audio_features: 'id',
  track_lists: '',
  last_updated: ''
});

export {didb};