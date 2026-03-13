import {useState} from "react"
import {Outlet} from "react-router-dom";
import SongPreviewModal from "../components/modals/SongPreviewModal";

import { ListenOnClickContextType, SongPreviewInfo } from "../interfaces";

export default function TopPage(){

  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewInfo, setModalSongPreviewInfo] = useState<SongPreviewInfo>({name:"",artist:"",url:"",image:""});
  const [modalSongList, setModalSongList] = useState<SongPreviewInfo[]>([]);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);

  function handleListenOnClick(songPreviewInfo:SongPreviewInfo|undefined, list?: SongPreviewInfo[], index?: number){
    if(songPreviewInfo === undefined || songPreviewInfo === null){
      console.log("Song preview is undefined");
      return
    }
    setModalSongPreviewInfo(songPreviewInfo);
    if (list && list.length > 0 && index !== undefined) {
      setModalSongList(list);
      setModalCurrentIndex(index);
    } else {
      setModalSongList([]);
      setModalCurrentIndex(0);
    }
    setShowModal(true);
  }

  return(
    <div className="h-[calc(100%-3.5rem)] w-full flex flex-col">

      <Outlet context={{handleListenOnClick} satisfies ListenOnClickContextType}/>

      {showModal ?
          <SongPreviewModal 
            setShowModal={setShowModal} 
            songPreviewInfo={modalSongPreviewInfo}
            songList={modalSongList.length > 0 ? modalSongList : undefined}
            currentIndex={modalCurrentIndex}
            onIndexChange={setModalCurrentIndex}
          />
        :
          null
      }
    </div>
  )
}
