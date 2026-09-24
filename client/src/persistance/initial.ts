import { AppState, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types"
import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types"
import { serializeAsJSON } from "@excalidraw/excalidraw"
import { RefObject, useCallback } from "react"

import { BroadcastedExcalidrawElement } from "../types"
import { getJsonScript, getLocalStorageJson, setLocalStorageJson } from "../utils"
import { reconcileElements } from "../reconciliation"
import { loadLibrary } from "./library"

function viewportStorageKey(roomName: string) {
  return `${roomName}:viewport`
}

function getSavedViewport(roomName: string) {
  return getLocalStorageJson(viewportStorageKey(roomName), {}) as Partial<AppState>
}

function saveViewport(roomName: string, appState: Partial<AppState>) {
  setLocalStorageJson(viewportStorageKey(roomName), {
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
    zoom: appState.zoom,
  })
}

/**
 * Get initial data for the room by merging the data from localStorage
 * and the remote data which is supplied by the server via the room html
 * (JSON script with ID `#initial-elements`).
 *
 * @param roomName room name to get initial data for
 * @returns initial data for the room
 */
export function getInitialData(roomName: string): ImportedDataState {
  let elementsFromServer: BroadcastedExcalidrawElement[] = getJsonScript("initial-elements", [])
  let filesFromServer: BinaryFiles = getJsonScript("files", {})

  let localState: ImportedDataState = getLocalStorageJson(roomName)
  let localElements = localState?.elements ?? []
  let localAppState = {
    editingElement: null,
    resizingElement: null,
    draggingElement: null,
    ...localState?.appState,
    ...getSavedViewport(roomName),
    // figury (kwadrat, romb) domyślnie z ostrymi rogami i idealnie prostymi liniami
    // (styl "Architekt") — zaokrąglenia i odręczny styl zniekształcają zapis
    // matematyczny; nadpisujemy też stan zapisany wcześniej w localStorage
    currentItemRoundness: "sharp" as const,
    currentItemRoughness: 0,
  }
  let localFiles = localState?.files ?? {}

  return {
    elements: reconcileElements(localElements, elementsFromServer, localAppState),
    appState: localAppState,
    libraryItems: loadLibrary(),
    files: { ...filesFromServer, ...localFiles },
  }
}

/**
 * @returns initial data for replay mode
 */
export function getInitialReplayData(): ImportedDataState {
  return { files: getJsonScript("files", {}) }
}

/**
 * A react hook which saves the state of the current room.
 *
 * @param apiRef a ref tot he excalidraw API
 * @param roomName room name to save a state for
 * @param readonly when true, only the viewport is persisted
 * @returns hook
 */
export function useSaveState(
  apiRef: RefObject<ExcalidrawImperativeAPI>,
  roomName: string,
  readonly = false
) {
  return useCallback(() => {
    const appState = apiRef.current?.getAppState()
    if (!appState) return

    saveViewport(roomName, appState)

    if (readonly) return

    const elements = apiRef.current?.getSceneElements() ?? []
    const state: Partial<AppState> = { ...appState }
    const files = apiRef.current?.getFiles() ?? {}
    delete state.collaborators
    localStorage.setItem(roomName, serializeAsJSON(elements, state, files, "local"))
  }, [apiRef, roomName, readonly])
}
