import { writeFileSync } from "fs"
import path from "path"

import { EXPORT_DIR } from "./constants.mjs"
import { getMapAreas } from "./tasks/getMapAreas.mjs"

const mapAreas = getMapAreas()

writeFileSync(path.join(EXPORT_DIR, `Map.Area.lua`), mapAreas)
