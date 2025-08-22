import worldMapArea from '../../exports/json/WorldMapArea.json' with {
  type: 'json',
}
import worldMapOverlay from '../../exports/json/WorldMapOverlay.json' with {
  type: 'json',
}
import { MAP_HEIGHT, MAP_WIDTH } from '../constants.mjs'
import { AREA_ID_OVERRIDES } from '../overrides.mjs'
import { floatToPrecision } from '../utils.mjs'

const overlaysByMapId = Object.groupBy(worldMapOverlay, (o) => o.MapArea)
const overlaysByAreaId = Object.groupBy(worldMapOverlay, (o) => o.AreaID_1)

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
    spwMapId,
  ) => {
    const x = floatToPrecision((HitRectLeft / MAP_WIDTH) * 100, 2)
    const y = floatToPrecision((HitRectTop / MAP_HEIGHT) * 100, 2)
    const w = floatToPrecision(
      ((HitRectRight - HitRectLeft) / MAP_WIDTH) * 100,
      2,
    )
    const h = floatToPrecision(
      ((HitRectBottom - HitRectTop) / MAP_HEIGHT) * 100,
      2,
    )

    const mapArea = worldMapArea.find(({ ID }) => ID === MapArea)
    const MapAreaName = mapArea.AreaName.toLowerCase()

    return {
      TextureName: TextureName.toLowerCase(),
      MapArea: MapAreaName,
      OverlayString: `${OffsetX},${OffsetY},${TextureWidth},${TextureHeight}`,
      HotspotString: `${x}^${y}^${w}^${h}^${TextureName}`,
      SpwMapId: spwMapId,
    }
  }

  const overlays = enrichedMapAreas
    .map((area) => {
      const areaIdToUse = AREA_ID_OVERRIDES[area.areaId] || area.areaId
      const overlays =
        overlaysByMapId[area.mapId] || overlaysByAreaId[areaIdToUse]

      if (!overlays) {
        console.info(area.spwMapId, area.mapId, area.name)
      }

      return (
        overlays?.map((overlay) => overlayToHotspot(overlay, area.spwMapId)) ||
        []
      )
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
