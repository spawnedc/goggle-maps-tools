import { writeFileSync } from "fs"
import path from "path"

import { EXPORT_DIR } from "./constants.mjs"
import { getMapAreas } from "./tasks/getMapAreas.mjs"
import { getWorldMapOverlay } from "./tasks/getZoneOverlays.mjs"

const mapAreas = getMapAreas()
writeFileSync(path.join(EXPORT_DIR, `Map.Area.lua`), mapAreas)

const mapOverlays = getWorldMapOverlay()
writeFileSync(path.join(EXPORT_DIR, `Map.Overlay.lua`), mapOverlays)
