import worldMapOverlay from "../../exports/json/WorldMapOverlay.json" with { type: "json" }
import worldMapArea from "../../exports/json/WorldMapArea.json" with { type: "json" }
import { floatToPrecision } from "../utils.mjs"

export const getWorldMapOverlay = (mapAreas) => {
  const enrichedMapAreas = Object.entries(mapAreas).map(
    ([spwMapId, value]) => ({
      ...value,
      spwMapId,
    }),
  )
  const enrichedMapAreasByAreaId = Object.groupBy(enrichedMapAreas, (a => a.areaId))

  const overlays = worldMapOverlay.map(
    ({
      TextureName,
      MapArea,
      AreaID_1,
      OffsetX,
      OffsetY,
      TextureWidth,
      TextureHeight,
      HitRectLeft,
      HitRectTop,
      HitRectRight,
      HitRectBottom,
    }) => {
      const x = floatToPrecision((HitRectLeft / 1022) * 100, 2)
      const y = floatToPrecision((HitRectTop / 668) * 100, 2)
      const w = floatToPrecision(((HitRectRight - HitRectLeft) / 1002) * 100, 2)
      const h = floatToPrecision(((HitRectBottom - HitRectTop) / 668) * 100, 2)

      const mapArea = worldMapArea.find(({ ID }) => ID === MapArea)
      const MapAreaName = mapArea.AreaName.toLowerCase()

      const areaInfo = enrichedMapAreas.find(
        (area) => area.overlay === MapAreaName,
      )

      const realArea = enrichedMapAreasByAreaId[AreaID_1]?.[0]
      const isCity = realArea?.isCity
      const spwMapId = isCity ? realArea?.spwMapId : areaInfo?.spwMapId

      return {
        TextureName: TextureName.toLowerCase(),
        MapArea: MapAreaName,
        OverlayString: `${OffsetX},${OffsetY},${TextureWidth},${TextureHeight}`,
        HotspotString: `${x}^${y}^${w}^${h}`,
        SpwMapId: spwMapId,
        isCity
      }
    },
  )
  const groups = Object.groupBy(overlays, (o) => o.MapArea)
  const keys = Object.keys(groups)

  const groupedOverlays = keys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: groups[key].reduce(
        (acc2, { TextureName, OverlayString }) => ({
          ...acc2,
          [TextureName]: OverlayString,
        }),
        {},
      ),
    }
  }, {})

  const hotspots = Object.groupBy(overlays, (o) => o.SpwMapId)
  const hotspotKeys = Object.keys(hotspots).filter((k) => k !== "undefined")

  const groupedHotspots = hotspotKeys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: hotspots[key].map(({ HotspotString }) => HotspotString).join("~"),
    }
  }, {})

  return {
    overlays: groupedOverlays,
    hotspots: groupedHotspots,
  }
}
