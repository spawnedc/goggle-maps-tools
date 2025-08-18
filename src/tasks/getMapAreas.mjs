import continents from "../../exports/json/WorldMapContinent.json" with { type: "json" }
import map from "../../exports/json/Map.json" with { type: "json" }
import areaTable from "../../exports/json/AreaTable.json" with { type: "json" }
import worldMapArea from "../../exports/json/WorldMapArea.json" with { type: "json" }

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

    if (!continentAreaData) {
      return undefined
    }

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
      name: mapById[continent.MapID].MapName,
      ...getXYScale(continentAreaData),
    }

    const areas = worldMapArea.filter(
      (wma) => wma.MapID === continent.MapID && wma.AreaID !== 0,
    )

    const areasData = areas.map((area, index) => {
      return {
        name: areaById[area.AreaID].AreaName,
        areaId: area.AreaID,
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

  const worldAreasById = arrayByObjecKey(
    data.filter((d) => d).flat(),
    "id",
    true,
  )

  return worldAreasById
}
