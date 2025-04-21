// 0. generate dbc schema from WDBX.Editor (generateDbcSchema.js)
// 1. extract DBCs and md5translate.trs from MPQs -> export-dbc.py TODO: convert to JS, also only required DBCs
// 2. convert DBCs to JSON -> node-dbc-reader
// 3. Should be able to do it with a clean install (no data and exports folders)

import { join } from "path"
import extractMPQ from "./extractMPQ.js"
import { BASE_DIR } from "../constants.mjs"

const [, , wowPath] = process.argv

extractMPQ(
  wowPath,
  "dbc.MPQ",
  ["DBFilesClient\\*"],
  join(BASE_DIR, "exports", "tmp"),
)
extractMPQ(
  wowPath,
  "texture.MPQ",
  ["textures\\Minimap\\md5translate.trs"],
  join(BASE_DIR, "exports", "tmp"),
)
