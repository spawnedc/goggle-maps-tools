import { writeFileSync } from "fs"
import { jsObjectToLuaPretty } from "json_to_lua"
import path from "path"

import { EXPORT_DIR } from "./constants.mjs"
import { getMapAreas } from "./tasks/getMapAreas.mjs"
import { getWorldMapOverlay } from "./tasks/getZoneOverlays.mjs"

const mapAreas = getMapAreas()
const mapAreasLuaContent = jsObjectToLuaPretty(mapAreas)
const mapAreasContent = [
  "setfenv(1, SpwMap)",
  `SpwMap.Map.Area = ${mapAreasLuaContent}`,
]
writeFileSync(path.join(EXPORT_DIR, `Map.Area.lua`), mapAreasContent.join("\n"))

const { overlays, hotspots } = getWorldMapOverlay(mapAreas)

const overlaysLuaContent = jsObjectToLuaPretty(overlays)
const overlaysContent = [
  "setfenv(1, SpwMap)",
  `SpwMap.Map.Overlay = ${overlaysLuaContent}`,
]
writeFileSync(
  path.join(EXPORT_DIR, `Map.Overlay.lua`),
  overlaysContent.join("\n"),
)

const hotspotsLuaContent = jsObjectToLuaPretty(hotspots)
const hotspotsContent = [
  "setfenv(1, SpwMap)",
  `SpwMap.Map.Hotspots = ${hotspotsLuaContent}`,
]
writeFileSync(
  path.join(EXPORT_DIR, `Map.Hotspots.lua`),
  hotspotsContent.join("\n"),
)
