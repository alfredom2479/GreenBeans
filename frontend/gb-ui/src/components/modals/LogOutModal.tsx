import { Dispatch, SetStateAction } from "react"
import { useNavigate } from "react-router-dom"

export default function LogOutModal({
  setShowModal,
}: {
  setShowModal: Dispatch<SetStateAction<boolean>>
}) {
  const navigate = useNavigate()

  function handleLogOut() {
    setShowModal(false)
    localStorage.clear()
    sessionStorage.clear()
    navigate("/")
    window.location.reload()
  }

  return (
    <div
      className="z-20 fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      aria-describedby="logout-description"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900/95 shadow-2xl border border-zinc-700/50 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1 text-center mb-6">
          <h2
            id="logout-title"
            className="text-xl sm:text-2xl font-semibold text-white"
          >
            Log out?
          </h2>
          <p
            id="logout-description"
            className="text-sm text-zinc-400"
          >
            You’ll need to sign in again to add songs to your library and view your saved and top tracks.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="flex-1 px-4 py-3 rounded-xl text-base font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogOut}
            className="flex-1 px-4 py-3 rounded-xl text-base font-medium text-white bg-red-600 hover:bg-red-500 border border-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
