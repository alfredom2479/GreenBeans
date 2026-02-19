import { Dispatch, SetStateAction, useRef } from "react"
import { SongPreviewInfo } from "../../interfaces"

interface params  {
  setShowModal: Dispatch<SetStateAction<boolean>>,
  songPreviewInfo: SongPreviewInfo
}

export default function SongPreviewModal({setShowModal,songPreviewInfo}: params){

  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div
      className="z-20 fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Song preview"
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col rounded-2xl bg-zinc-900/95 shadow-2xl border border-zinc-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Artwork */}
        <div className="relative shrink-0">
          <img
            src={songPreviewInfo.image}
            alt=""
            className="w-full aspect-square max-h-[50vh] object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 p-4 sm:p-5 pt-2">
          <h2 className="text-lg sm:text-xl font-semibold text-white truncate pr-8">
            {songPreviewInfo.name}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 truncate mt-0.5">
            {songPreviewInfo.artist}
          </p>

          <audio
            ref={audioRef}
            src={songPreviewInfo.url}
            controls
            className="w-full mt-4 h-10 accent-green-500 [&::-webkit-media-controls-panel]:bg-zinc-800"
          />
        </div>
      </div>
    </div>
  )
}