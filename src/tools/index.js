// 0. generate dbc schema from WDBX.Editor (generateDbcSchema.js)
// 1. extract DBCs and md5translate.trs from MPQs -> export-dbc.py TODO: convert to JS, also only required DBCs
// 2. convert DBCs to JSON -> node-dbc-reader
// 3. Should be able to do it with a clean install (no data and exports folders)

import { join } from "path"
import { EXPORT_DIR } from "../constants.mjs"
import extractMPQ from "./extractMPQ.js"
import convertDbcToJson from "./extractJsonFromDbc/index.js"

const [, , wowPath] = process.argv

const dbcFilesToExtract = [
  "WorldMapContinent",
  "Map",
  "AreaTable",
  "WorldMapArea",
  "WorldMapOverlay",
]

const dbcPath = join(EXPORT_DIR, "dbc")
const jsonPath = join(EXPORT_DIR, "json")

const go = async () => {
  await extractMPQ(wowPath, "dbc.MPQ", `DBFilesClient\\*`, dbcPath)
  await extractMPQ(
    wowPath,
    "texture.MPQ",
    ["textures\\Minimap\\md5translate.trs"],
    dbcPath,
  )

  await convertDbcToJson(dbcFilesToExtract, {
    dbcPath,
    outDir: jsonPath,
  })
}

go()
