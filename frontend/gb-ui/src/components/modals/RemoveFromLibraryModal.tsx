import { Dispatch, SetStateAction } from "react"

interface RemoveFromLibraryModalParams {
  setShowModal: Dispatch<SetStateAction<boolean>>
  trackName: string
  artistName: string
  onConfirm: () => void | Promise<void>
}

export default function RemoveFromLibraryModal({
  setShowModal,
  trackName,
  artistName,
  onConfirm,
}: RemoveFromLibraryModalParams) {
  async function handleConfirm() {
    await onConfirm()
  }

  return (
    <div
      className="z-20 fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-from-library-title"
      aria-describedby="remove-from-library-description"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900/95 shadow-2xl border border-zinc-700/50 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1 text-center mb-6">
          <h2
            id="remove-from-library-title"
            className="text-xl sm:text-2xl font-semibold text-white"
          >
            Remove from library?
          </h2>
          <p
            id="remove-from-library-description"
            className="text-sm text-zinc-400"
          >
            Are you sure you want to remove{" "}
            <span className="font-medium text-zinc-200">{trackName}</span>
            {" "}by{" "}
            <span className="font-medium text-zinc-200">{artistName}</span>
            {" "}from your library?
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="flex-1 px-4 py-3 rounded-xl text-base font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-base font-medium text-white bg-red-600 hover:bg-red-500 border border-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
