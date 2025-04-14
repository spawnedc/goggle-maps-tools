import { jsObjectToLuaPretty } from "json_to_lua"
import continents from "../../data/WorldMapContinent.json" with { type: "json" }
import map from "../../data/Map.json" with { type: "json" }
import areaTable from "../../data/AreaTable.json" with { type: "json" }
import worldMapArea from "../../data/WorldMapArea.json" with { type: "json" }

import { arrayByObjecKey, getXYScale } from "../utils.mjs"
import { IS_CITY_FLAG } from "../constants.mjs"

const ID_MAP = {
  1: 2,
  2: 1,
}

export const getMapAreas = () => {
  const mapById = arrayByObjecKey(map, "ID")
  const areaById = arrayByObjecKey(areaTable, "ID")

  const data = continents.map((continent) => {
    const continentAreaData = worldMapArea.find(
      (wma) => wma.MapID === continent.MapID && wma.AreaID === 0,
    )

    // This is where it gets ridiculous. According to the DBC:
    // 1: Azeroth (Eastern Kingdoms)
    // 2: Kalimdor
    //
    // However, according to the game, they are swapped...
    // Only the `baseId` calculation below is affected.
    // So we have to do dirty work here.
    const baseId = (ID_MAP[continent.ID] || continent.ID) * 1000

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
        ...(areaById[area.AreaID].Flags === IS_CITY_FLAG
          ? { isCity: true }
          : {}),
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

  const luaContent = jsObjectToLuaPretty(worldAreasById)

  const content = ["setfenv(1, SpwMap)", `SpwMap.Map.Area = ${luaContent}`]

  return content.join("\n")
}
