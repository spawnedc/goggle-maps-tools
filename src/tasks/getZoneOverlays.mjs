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

  const overlays = worldMapOverlay.map(
    ({
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
    }) => {
      const x = floatToPrecision((HitRectLeft / 1022) * 100, 2)
      const y = floatToPrecision((HitRectTop / 668) * 100, 2)
      const w = floatToPrecision(((HitRectRight - HitRectLeft) / 1002) * 100, 2)
      const h = floatToPrecision(((HitRectBottom - HitRectTop) / 668) * 100, 2)

      const MapAreaName = worldMapArea
        .find(({ ID }) => ID === MapArea)
        .AreaName.toLowerCase()

      const spwMapId = enrichedMapAreas.find(
        (area) => area.overlay === MapAreaName,
      )?.spwMapId

      return {
        TextureName: TextureName.toLowerCase(),
        MapArea: MapAreaName,
        OverlayString: `${OffsetX},${OffsetY},${TextureWidth},${TextureHeight}`,
        HotspotString: `${x}^${y}^${w}^${h}`,
        SpwMapId: spwMapId,
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
