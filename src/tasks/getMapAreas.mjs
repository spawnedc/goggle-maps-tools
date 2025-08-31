import areaTable from '../../exports/json/AreaTable.json' with { type: 'json' }
import map from '../../exports/json/Map.json' with { type: 'json' }
import worldMapArea from '../../exports/json/WorldMapArea.json' with {
  type: 'json',
}
import continents from '../../exports/json/WorldMapContinent.json' with {
  type: 'json',
}
import {
  BATTLEGROUND_CONTINENT_ID,
  INSTANCE_CONTINENT_ID,
  IS_ARENA_FLAG,
  IS_CITY_FLAG,
  RAID_CONTINENT_ID,
} from '../constants.mjs'
import { arrayByObjecKey, getXYScale, hasFlag } from '../utils.mjs'

const ID_MAP = {
  1: 2,
  2: 1,
}

const mapById = arrayByObjecKey(map, 'ID')
const areaById = arrayByObjecKey(areaTable, 'ID')

const buildMapAreas = (filteredWorldMapAreas, continentId) => {
  const baseId = continentId * 1000
  const areasData = filteredWorldMapAreas.map((worldMapArea) => {
    // const map = mapById[worldMapArea.MapID]
    const area = areaById[worldMapArea.AreaID]
    const isCity = hasFlag(area.Flags, IS_CITY_FLAG)
    // worldMapArea.AreaName.toLowerCase().endsWith('entrance')
    const isInstance = continentId === INSTANCE_CONTINENT_ID
    const isRaid = continentId === RAID_CONTINENT_ID
    const isBattleground = continentId === BATTLEGROUND_CONTINENT_ID
    const isNormalZone = !isInstance && !isRaid && !isBattleground
    return {
      name: area.AreaName,
      // name: isNormalZone ? area.AreaName : map.MapName,
      areaId: worldMapArea.AreaID,
      mapId: worldMapArea.ID,
      ...getXYScale(worldMapArea),
      ...(!isNormalZone ? { scale: 0.04 } : {}),
      overlay: worldMapArea.AreaName.toLocaleLowerCase(),
      faction: area.FactionGroupMask, // 0: contested, 2: alliance, 4: horde
      ...(isCity ? { isCity: true } : {}),
      ...(isInstance ? { isInstance: true } : {}),
      ...(isRaid ? { isRaid: true } : {}),
      ...(isBattleground ? { isBattleground: true } : {}),
    }
  })

  areasData.sort((a, b) => a.name.localeCompare(b.name))

  return areasData.map((a, index) => ({
    id: baseId + index + 1,
    ...a,
  }))
}

export const getMapAreas = () => {
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
    const continentIdToUse = ID_MAP[continent.ID] || continent.ID
    const baseId = continentIdToUse * 1000

    const continentData = {
      id: baseId,
      name: mapById[continent.MapID].MapName,
      ...getXYScale(continentAreaData),
    }

    const continentMapAreas = worldMapArea.filter(
      (wma) => wma.MapID === continent.MapID && wma.AreaID !== 0,
    )

    const areasData = buildMapAreas(continentMapAreas, continentIdToUse)

    return [continentData, ...areasData]
  })

  // InstanceType = 0: none, 1: party (5-man dungeon), 2: raid, 3: pvp
  const mapsByInstanceType = (instanceType) =>
    worldMapArea
      .filter((wma) => {
        const hasAreaId = wma.AreaID !== 0
        const map = mapById[wma.MapID]
        const isInstance = map?.InstanceType === instanceType
        const area = hasAreaId ? areaById[wma.AreaID] : undefined
        const isArena = hasFlag(area?.Flags || 0, IS_ARENA_FLAG)

        return hasAreaId && isInstance && !isArena
      })
      .toSorted((a, b) => a.AreaName.localeCompare(b.AreaName))

  const instances = buildMapAreas(mapsByInstanceType(1), INSTANCE_CONTINENT_ID)
  const raids = buildMapAreas(mapsByInstanceType(2), RAID_CONTINENT_ID)
  const battlegrounds = buildMapAreas(
    mapsByInstanceType(3),
    BATTLEGROUND_CONTINENT_ID,
  )

  data.push(...instances, ...raids, ...battlegrounds)

  const worldAreasById = arrayByObjecKey(
    data.filter((d) => d).flat(),
    'id',
    true,
  )

  return worldAreasById
}
