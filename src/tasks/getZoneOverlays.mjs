import worldMapArea from '../../exports/json/WorldMapArea.json' with {
  type: 'json',
}
import worldMapOverlay from '../../exports/json/WorldMapOverlay.json' with {
  type: 'json',
}
import { MAP_HEIGHT, MAP_WIDTH } from '../constants.mjs'
import { AREA_ID_OVERRIDES } from '../overrides.mjs'
import { arrayByObjecKey, floatToPrecision } from '../utils.mjs'

const overlaysByMapId = Object.groupBy(worldMapOverlay, (o) => o.MapArea)
const overlaysByAreaId = Object.groupBy(worldMapOverlay, (o) => o.AreaID_1)
const worldMapAreaById = arrayByObjecKey(worldMapArea, 'ID')
const worldMapAreaByAreaId = arrayByObjecKey(worldMapArea, 'AreaID')

export const getWorldMapOverlay = (mapAreas) => {
  const enrichedMapAreas = Object.entries(mapAreas)
    .map(([spwMapId, value]) => ({
      ...value,
      spwMapId,
    }))
    .filter((a) => !!a.mapId)

  const overlayToHotspot = (
    {
      TextureName,
      MapArea,
      OffsetX,
      OffsetY,
      TextureWidth,
      TextureHeight,
      HitRectLeft,
      HitRectTop,
      HitRectRight,
      HitRectBottom,
    },
    area,
  ) => {
    const mapArea = worldMapAreaById[MapArea]
    const MapAreaName = mapArea.AreaName.toLowerCase()

    let x1, y1, x2, y2, w, h

    if (area.isCity) {
      const cityArea = worldMapAreaByAreaId[area.areaId]
      const { LocLeft, LocRight, LocTop, LocBottom } = cityArea
      const yardsPerMapUnit = 5
      x1 = floatToPrecision(-LocLeft / yardsPerMapUnit, 2)
      y1 = floatToPrecision(LocBottom / yardsPerMapUnit, 2)
      x2 = floatToPrecision(-LocRight / yardsPerMapUnit, 2)
      y2 = floatToPrecision(LocTop / yardsPerMapUnit, 2)

      w = floatToPrecision(x2 - x1, 2)
      h = floatToPrecision(y2 - y1, 2)
    } else {
      x1 = floatToPrecision((HitRectLeft / MAP_WIDTH) * 100, 2)
      y1 = floatToPrecision((HitRectTop / MAP_HEIGHT) * 100, 2)
      w = floatToPrecision(((HitRectRight - HitRectLeft) / MAP_WIDTH) * 100, 2)
      h = floatToPrecision(((HitRectBottom - HitRectTop) / MAP_HEIGHT) * 100, 2)
    }

    return {
      TextureName: TextureName.toLowerCase(),
      MapArea: MapAreaName,
      OverlayString: `${OffsetX},${OffsetY},${TextureWidth},${TextureHeight}`,
      HotspotString: `${x1}^${y1}^${w}^${h}^${TextureName}`,
      SpwMapId: area.spwMapId,
    }
  }

  const overlays = enrichedMapAreas
    .map((area) => {
      const areaIdToUse = AREA_ID_OVERRIDES[area.areaId] || area.areaId
      const overlays =
        overlaysByMapId[area.mapId] || overlaysByAreaId[areaIdToUse]

      return overlays?.map((overlay) => overlayToHotspot(overlay, area)) || []
    })
    .flat()
    .filter(Boolean)

  const groups = Object.groupBy(overlays, (o) => o.MapArea)
  const keys = Object.keys(groups)

  const groupedOverlays = keys.reduce((acc, key) => {
    const innerGroups = groups[key].reduce(
      (acc2, { TextureName, OverlayString }) => {
        acc2[TextureName] = OverlayString
        return acc2
      },
      {},
    )
    acc[key] = innerGroups
    return acc
  }, {})

  const hotspots = Object.groupBy(overlays, (o) => o.SpwMapId)
  const hotspotKeys = Object.keys(hotspots).filter((k) => k !== 'undefined')

  const groupedHotspots = hotspotKeys.reduce((acc, key) => {
    acc[key] = hotspots[key].map(({ HotspotString }) => HotspotString).join('~')
    return acc
  }, {})

  return {
    overlays: groupedOverlays,
    hotspots: groupedHotspots,
  }
}
