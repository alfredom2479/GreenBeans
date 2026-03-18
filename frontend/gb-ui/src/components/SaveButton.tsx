import { useCallback, useEffect, useState } from "react";

import { ITrack, TrackSaveState } from "../interfaces";

import addTrackSvg from "../assets/plus2.svg";
import trackSavedSvg from "../assets/check.svg";
import { saveSpotifyTrack, unsaveSpotifyTrack } from "../api";
import { didb } from "../dexiedb";
import RemoveFromLibraryModal from "./modals/RemoveFromLibraryModal";

interface SaveButtonParams {
  trackInfo: ITrack;
  onSaved?: (track: ITrack) => void;
  onUnsaved?: (track: ITrack) => void;
}

export default function SaveButton({ trackInfo, onSaved, onUnsaved }: SaveButtonParams) {
  const savedSaveButtonClassName =
    "flex-1 bg-green-200 text-black flex p-1 text-center items-center justify-center font-bold text-lg shrink-0  h-full";
  const disabledSaveButtonClassName =
    "flex-1 bg-neutral-600 text-black flex p-1 text-center items-center justify-center font-bold text-lg shrink-0  h-full";
  const saveableSaveButtonClassName =
    "flex-1 bg-stone-200 text-black flex p-1 text-center items-center justify-center font-bold text-lg shrink-0  h-full hover:bg-stone-300";

  const [saveButton, setSaveButton] = useState(
    <button className={disabledSaveButtonClassName} disabled>
      <img src={addTrackSvg} alt="unsaveable" className="w-8" />
    </button>
  );
  const [showUnsaveModal, setShowUnsaveModal] = useState(false);

  const handleSaveOnClick = useCallback(async () => {
    trackInfo.trackSaveState = TrackSaveState.Saved;
    setSaveButton(
      <button className={savedSaveButtonClassName} disabled>
        <img src={trackSavedSvg} alt="saved" className="w-8" />
      </button>
    );

    try {
      const responseData = await saveSpotifyTrack(trackInfo.id);
      if (!responseData) {
        trackInfo.trackSaveState = TrackSaveState.Saveable;
        setSaveButton(
          <button className={saveableSaveButtonClassName} onClick={() => handleSaveOnClick()}>
            <img src={addTrackSvg} alt="save" className="w-8" />
          </button>
        );
        return;
      }
      trackInfo.trackSaveState = TrackSaveState.Saved;
      setSaveButton(
        <button className={savedSaveButtonClassName} onClick={() => setShowUnsaveModal(true)}>
          <img src={trackSavedSvg} alt="saved" className="w-8" />
        </button>
      );
      try {
        await didb.tracks.put({ ...trackInfo, trackSaveState: TrackSaveState.Saved });
      } catch (err) {
        console.log("error adding track to dexie ", err);
      }
      sessionStorage.setItem("last_track_saved_time", Date.now().toString());
      onSaved?.(trackInfo);
    } catch (err) {
      console.log("Error saving track", err);
    }
  }, [trackInfo]);

  const handleUnsaveOnClick = useCallback(async () => {
    try {
      const res = await unsaveSpotifyTrack(trackInfo.id);
      if (res?.ok) {
        trackInfo.trackSaveState = TrackSaveState.Saveable;
        setSaveButton(
          <button className={saveableSaveButtonClassName} onClick={() => handleSaveOnClick()}>
            <img src={addTrackSvg} alt="save" className="w-8" />
          </button>
        );
        try {
          await didb.tracks.delete(trackInfo.id);
        } catch (err) {
          console.log("error removing track from dexie", err);
        }
        sessionStorage.setItem("last_track_saved_time", Date.now().toString());
        onUnsaved?.(trackInfo);
      }
    } catch (err) {
      console.log("Error unsaving track", err);
    }
  }, [trackInfo, handleSaveOnClick]);

  useEffect(() => {
    if (trackInfo.trackSaveState === TrackSaveState.Saveable) {
      setSaveButton(
        <button className={saveableSaveButtonClassName} onClick={() => handleSaveOnClick()}>
          <img src={addTrackSvg} alt="save" className="w-8" />
        </button>
      );
    } else if (trackInfo.trackSaveState === TrackSaveState.Saved) {
      setSaveButton(
        <button className={savedSaveButtonClassName} onClick={() => setShowUnsaveModal(true)}>
          <img src={trackSavedSvg} alt="saved" className="w-8" />
        </button>
      );
    }
  }, [trackInfo, handleSaveOnClick]);

  return (
    <>
      {saveButton}
      {showUnsaveModal && (
        <RemoveFromLibraryModal
          setShowModal={setShowUnsaveModal}
          trackName={trackInfo.name}
          artistName={trackInfo.artist}
          onConfirm={async () => {
            await handleUnsaveOnClick();
            setShowUnsaveModal(false);
          }}
        />
      )}
    </>
  );
}
