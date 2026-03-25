import { Dispatch, SetStateAction } from "react";

interface ClearHistoryModalParams {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void | Promise<void>;
  isClearing?: boolean;
}

export default function ClearHistoryModal({
  setShowModal,
  onConfirm,
  isClearing = false,
}: ClearHistoryModalParams) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <div
      className="z-20 fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => !isClearing && setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-history-title"
      aria-describedby="clear-history-description"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-zinc-900/95 shadow-2xl border border-zinc-700/50 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1 text-center mb-6">
          <h2
            id="clear-history-title"
            className="text-xl sm:text-2xl font-semibold text-white"
          >
            Clear history?
          </h2>
          <p
            id="clear-history-description"
            className="text-sm text-zinc-400"
          >
            This removes your history of tracks you've viewed inGreenBeans. This cannot be
            undone.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={isClearing}
            className="flex-1 px-4 py-3 rounded-xl text-base font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isClearing}
            className="flex-1 px-4 py-3 rounded-xl text-base font-medium text-white bg-red-600 hover:bg-red-500 border border-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isClearing ? "Clearing…" : "Clear history"}
          </button>
        </div>
      </div>
    </div>
  );
}
