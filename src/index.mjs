import { jsObjectToLua } from "json_to_lua"
import { writeFileSync } from "fs"
import path from "path"
import continents from "../data/WorldMapContinent.json" with { type: "json" }
import map from "../data/Map.json" with { type: "json" }
import areaTable from "../data/AreaTable.json" with { type: "json" }
import worldMapArea from "../data/WorldMapArea.json" with { type: "json" }

import { arrayByObjecKey, getXYScale } from "./utils.mjs"
import { EXPORT_DIR } from "./constants.mjs"

// See: https://wowdev.wiki/DB/AreaTable
const IS_CITY_FLAG = 312

const mapById = arrayByObjecKey(map, "ID")
const areaById = arrayByObjecKey(areaTable, "ID")

const data = continents.map((continent) => {
  const continentAreaData = worldMapArea.find(
    (wma) => wma.MapID === continent.MapID && wma.AreaID === 0,
  )

  const baseId = continent.ID * 1000

  const continentData = {
    id: baseId,
    name: mapById[continent.MapID].MapName_enUS,
    ...getXYScale(continentAreaData),
  }

  const areas = worldMapArea.filter(
    (wma) => wma.MapID === continent.MapID && wma.AreaID !== 0,
  )

  const areasData = areas.map((area, index) => {
    return {
      name: areaById[area.AreaID].AreaName_enUS,
      ...getXYScale(area),
      overlay: area.AreaName.toLocaleLowerCase(),
      ...(areaById[area.AreaID].Flags === IS_CITY_FLAG ? { isCity: true } : {}),
    }
  })

  areasData.sort((a, b) => a.name.localeCompare(b.name))

  return [
    continentData,
    ...areasData.map((a, index) => ({
      id: baseId + index + 1, // Lua indexes start from 1
      ...a,
    })),
  ]
})

const worldAreasById = arrayByObjecKey(data.flat(), "id", true)

const luaContent = jsObjectToLua(worldAreasById)

const content = ["setfenv(1, SpwMap)", `SpwMap.Map.Area = ${luaContent}`]

writeFileSync(path.join(EXPORT_DIR, `Map.Area.lua`), content.join("\n"))
