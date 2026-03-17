import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { ITrack, SongPreviewInfo } from "../../interfaces"
import SaveButton from "../SaveButton"
import findRecsSvg from "../../assets/search-list.svg"

const SWIPE_THRESHOLD_PX = 50

function trackToPreview(t: ITrack): SongPreviewInfo {
  return { name: t.name, artist: t.artist, url: t.url ?? "", image: t.image[0] }
}

interface params {
  setShowModal: Dispatch<SetStateAction<boolean>>,
  songPreviewInfo: SongPreviewInfo,
  currentIndex?: number,
  onIndexChange?: (index: number) => void,
  trackList?: ITrack[],
  hideSaveButton?: boolean,
  hideFindRecs?: boolean,
  onTrackSaved?: (track: ITrack) => void,
  onTrackUnsaved?: (track: ITrack) => void,
}

export default function SongPreviewModal({
  setShowModal,
  songPreviewInfo,
  currentIndex = 0,
  onIndexChange,
  trackList,
  hideSaveButton = false,
  hideFindRecs = false,
  onTrackSaved,
  onTrackUnsaved,
}: params) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartedOnAudio = useRef(false)

  const index = trackList && trackList.length > 0 ? Math.max(0, Math.min(currentIndex, trackList.length - 1)) : 0
  const currentTrack: ITrack | undefined = trackList?.[index]
  const hasList = Array.isArray(trackList) && trackList.length > 1 && typeof onIndexChange === "function"
  const displayInfo: SongPreviewInfo = currentTrack ? trackToPreview(currentTrack) : songPreviewInfo
  const canPrev = hasList && index > 0
  const canNext = hasList && index < trackList!.length - 1

  const goPrev = useCallback(() => {
    if (canPrev && onIndexChange) onIndexChange(index - 1)
  }, [canPrev, index, onIndexChange])

  const goNext = useCallback(() => {
    if (canNext && onIndexChange) onIndexChange(index + 1)
  }, [canNext, index, onIndexChange])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !displayInfo.url?.trim()) return
    el.load()
    const onCanPlay = () => {
      el.play().catch(() => {}) // ignore autoplay policy rejections
    }
    el.addEventListener("canplay", onCanPlay, { once: true })
    return () => el.removeEventListener("canplay", onCanPlay)
  }, [displayInfo.url])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = audioRef.current
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    if (el) {
      const rect = el.getBoundingClientRect()
      touchStartedOnAudio.current = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    } else {
      touchStartedOnAudio.current = false
    }
    touchStartX.current = x
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartedOnAudio.current) {
      touchStartX.current = null
      touchStartedOnAudio.current = false
      return
    }
    if (!hasList || touchStartX.current == null) return
    const endX = e.changedTouches[0].clientX
    const delta = touchStartX.current - endX
    if (delta > SWIPE_THRESHOLD_PX) goNext()
    else if (delta < -SWIPE_THRESHOLD_PX) goPrev()
    touchStartX.current = null
  }, [hasList, goPrev, goNext])

  return (
    <div
      className="z-20 fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Song preview"
    >
      <div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto flex flex-col rounded-2xl bg-zinc-900/95 shadow-2xl border border-zinc-700/50"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

        {/* Prev / Next when list is provided */}
        {hasList && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              disabled={!canPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous track"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              disabled={!canNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next track"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Artwork */}
        <div className="relative shrink-0">
          <img
            src={displayInfo.image}
            alt=""
            className="w-full aspect-square max-h-[50dvh] object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 p-4 sm:p-5 pt-2">
          <h2 className="text-lg sm:text-xl font-semibold text-white truncate pr-8">
            {displayInfo.name}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 truncate mt-0.5">
            {displayInfo.artist}
          </p>

          {hasList && trackList && (
            <p className="text-xs text-zinc-500 mt-1">
              {index + 1} / {trackList.length}
            </p>
          )}

          {displayInfo.url && displayInfo.url.trim() !== "" ? (
            <audio
              ref={audioRef}
              src={displayInfo.url}
              controls
              className="w-full mt-4 h-10 accent-green-500 [&::-webkit-media-controls-panel]:bg-zinc-800"
            />
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Preview unavailable</p>
          )}

          {/* Recs + Save (same as TrackCard) */}
          {currentTrack && (!hideSaveButton || !hideFindRecs) && (
            <div className="flex gap-2 mt-4 items-stretch">
              {!hideSaveButton && (
                <div className="flex-1 min-w-0 flex items-center">
                  <SaveButton trackInfo={currentTrack} onSaved={onTrackSaved} onUnsaved={onTrackUnsaved} />
                </div>
              )}
              {!hideFindRecs && (
                <Link
                  to={`/track/${currentTrack.id}`}
                  onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                  //className="flex-1 flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 hover:text-white border border-zinc-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 shrink-0"
                  className="flex-1 bg-stone-200 hover:bg-green-700 text-black flex p-2 sm:p-3 text-center items-center justify-center font-bold  shrink-0 transition-colors"

                  aria-label="Find recommendations"
                >
                  <img src={findRecsSvg} alt="" className="w-8 h-8" />
                  {/* <span className="text-sm font-medium">Find recs</span> */}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}