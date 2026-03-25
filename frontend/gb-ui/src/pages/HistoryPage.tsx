import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import {
  handleNewTokens,
  refreshTokens,
  requestHistory,
  requestSaveStatus,
} from "../api";
import refreshSvg from "../assets/refresh-ccw-svgrepo-com.svg";
import TrackCard from "../components/TrackCard";
import SongPreviewModal from "../components/modals/SongPreviewModal";
import { ITrack, SongPreviewInfo, TrackSaveState } from "../interfaces";

const EMPTY_COVER =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="#292524" width="64" height="64"/></svg>'
  );

function normalizeHistoryImages(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (x): x is string => typeof x === "string" && x.trim().length > 0
    );
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }
  return [];
}

/** History rows from GET /getmyhistory (search + joined track columns). */
function historyRowToTrack(row: unknown): ITrack | null {
  if (row === null || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;

  const trackId = typeof r.track_id === "string" ? r.track_id : null;
  const name = typeof r.name === "string" ? r.name : null;
  const artist = typeof r.artist === "string" ? r.artist : null;

  if (!trackId || !name || !artist) return null;

  const images = normalizeHistoryImages(r.images);
  const image = images.length > 0 ? images : [EMPTY_COVER];

  const previewRaw = r.preview_url;
  const url =
    typeof previewRaw === "string" && previewRaw.trim().length > 0
      ? previewRaw
      : undefined;

  const spotifyRaw = r.spotify_url;
  const spotify_url =
    typeof spotifyRaw === "string" && spotifyRaw.trim().length > 0
      ? spotifyRaw
      : undefined;

  return {
    id: trackId,
    name,
    artist,
    image,
    url,
    spotify_url,
    trackSaveState: TrackSaveState.CantSave,
  };
}

function parseHistoryTracks(raw: unknown): ITrack[] {
  if (!Array.isArray(raw)) return [];
  const out: ITrack[] = [];
  for (const item of raw) {
    const t = historyRowToTrack(item);
    if (t !== null) out.push(t);
  }
  return out;
}

export type HistoryLoaderData = {
  tracks: ITrack[];
  error: string | null;
  info: string | null;
};

/** Shared by route loader and “Refresh session” on the history page. */
export async function fetchHistoryLoaderData(): Promise<HistoryLoaderData> {
  try {
    const result = await requestHistory();
    if (!Array.isArray(result)) {
      return {
        tracks: [],
        error: "History response was not an array.",
        info: null,
      };
    }
    const parsed = parseHistoryTracks(result);
    if (parsed.length === 0) {
      return {
        tracks: [],
        error: null,
        info:
          result.length === 0
            ? "No history entries."
            : "Could not parse history rows into tracks.",
      };
    }

    const accessToken = localStorage.getItem("access_token");
    if (accessToken && accessToken !== "") {
      try {
        const saveStatusData = await requestSaveStatus(accessToken, parsed);
        if (
          Array.isArray(saveStatusData) &&
          saveStatusData.length === parsed.length
        ) {
          return {
            tracks: parsed.map((t, i) => ({
              ...t,
              trackSaveState: saveStatusData[i]
                ? TrackSaveState.Saved
                : TrackSaveState.Saveable,
            })),
            error: null,
            info: null,
          };
        }
      } catch {
        /* fall through to CantSave */
      }
    }
    return {
      tracks: parsed.map((t) => ({
        ...t,
        trackSaveState: TrackSaveState.CantSave,
      })),
      error: null,
      info: null,
    };
  } catch (err) {
    return {
      tracks: [],
      error: err instanceof Error ? err.message : "Request failed.",
      info: null,
    };
  }
}

export async function HistoryLoader(): Promise<HistoryLoaderData> {
  return fetchHistoryLoaderData();
}

export default function HistoryPage() {
  const { tracks: loaderTracks, error: loaderError, info: loaderInfo } =
    useLoaderData() as HistoryLoaderData;

  const [tracks, setTracks] = useState<ITrack[]>(loaderTracks);
  const [error, setError] = useState<string | null>(loaderError);
  const [info, setInfo] = useState<string | null>(loaderInfo);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setTracks(loaderTracks);
    setError(loaderError);
    setInfo(loaderInfo);
  }, [loaderTracks, loaderError, loaderInfo]);

  async function handleRefreshSessionAndHistory() {
    setRefreshing(true);
    setError(null);
    setInfo(null);
    try {
      const { access_token } = await refreshTokens(
        localStorage.getItem("refresh_token")
      );
      if (access_token == null) {
        setError("Could not refresh access token. Try logging in again.");
        return;
      }
      const tokensHandled = handleNewTokens(access_token);
      if (!tokensHandled) {
        setError("Could not store the new access token.");
        return;
      }

      const data = await fetchHistoryLoaderData();
      setTracks(data.tracks);
      setError(data.error);
      setInfo(data.info);
    } catch (err) {
      if (err instanceof Response) {
        setError(`Token refresh failed (${err.status}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Token refresh or history failed.");
      }
    } finally {
      setRefreshing(false);
    }
  }

  const [showModal, setShowModal] = useState(false);
  const [modalSongPreviewInfo, setModalSongPreviewInfo] =
    useState<SongPreviewInfo>({
      name: "",
      artist: "",
      url: "",
      image: "",
    });
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
  const [modalTrackList, setModalTrackList] = useState<ITrack[]>([]);

  function handleListenOnClick(
    songPreviewInfo: SongPreviewInfo | undefined,
    index?: number,
    trackList?: ITrack[]
  ) {
    if (songPreviewInfo === undefined) return;
    setModalSongPreviewInfo(songPreviewInfo);
    if (trackList && trackList.length > 0 && index !== undefined) {
      setModalTrackList(trackList);
      setModalCurrentIndex(index);
    } else {
      setModalTrackList([]);
      setModalCurrentIndex(0);
    }
    setShowModal(true);
  }

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col px-4 sm:px-6 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl flex flex-1 min-h-0 flex-col gap-6">
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            History
          </h1>
          <button
            type="button"
            onClick={handleRefreshSessionAndHistory}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Refresh access token and reload history"
          >
            <img
              src={refreshSvg}
              alt=""
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden
            />
            <span className="text-sm font-medium">
              {refreshing ? "Refreshing…" : "Refresh"}
            </span>
          </button>
        </div>

        {error ? (
          <p className="shrink-0 text-red-400 text-sm" role="alert">
            {error}
          </p>
        ) : null}

        {info && !error ? (
          <p className="shrink-0 text-zinc-400 text-sm" role="status">
            {info}
          </p>
        ) : null}

        {tracks.length > 0 ? (
          <section
            aria-label="History tracks"
            className="flex min-h-0 flex-1 flex-col gap-2"
          >
            <h2 className="shrink-0 text-sm font-medium text-zinc-400">
              Tracks
            </h2>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border border-zinc-800/50 bg-zinc-900/30 divide-y divide-zinc-800/80">
              {tracks.map((track, index) => (
                <li key={`${track.id}-${index}`}>
                  <TrackCard
                    track={track}
                    popModal={(songInfo) =>
                      handleListenOnClick(songInfo, index, tracks)
                    }
                    hideSaveButton={false}
                    onSaved={(t) =>
                      setTracks((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? { ...x, trackSaveState: TrackSaveState.Saved }
                            : x
                        )
                      )
                    }
                    onUnsaved={(t) =>
                      setTracks((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? { ...x, trackSaveState: TrackSaveState.Saveable }
                            : x
                        )
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {showModal ? (
        <SongPreviewModal
          setShowModal={setShowModal}
          songPreviewInfo={modalSongPreviewInfo}
          currentIndex={modalCurrentIndex}
          onIndexChange={setModalCurrentIndex}
          trackList={modalTrackList.length > 0 ? modalTrackList : undefined}
          onTrackSaved={(t) => {
            const update = (prev: ITrack[]) =>
              prev.map((x) =>
                x.id === t.id
                  ? { ...x, trackSaveState: TrackSaveState.Saved }
                  : x
              );
            setTracks(update);
            setModalTrackList((prev) =>
              prev.length > 0 ? update(prev) : prev
            );
          }}
          onTrackUnsaved={(t) => {
            const update = (prev: ITrack[]) =>
              prev.map((x) =>
                x.id === t.id
                  ? { ...x, trackSaveState: TrackSaveState.Saveable }
                  : x
              );
            setTracks(update);
            setModalTrackList((prev) =>
              prev.length > 0 ? update(prev) : prev
            );
          }}
        />
      ) : null}
    </div>
  );
}
