import { jsObjectToLuaPretty } from "json_to_lua"

import worldMapOverlay from "../../data/WorldMapOverlay.json" with { type: "json" }
import worldMapArea from "../../data/WorldMapArea.json" with { type: "json" }

export const getWorldMapOverlay = () => {
  const overlays = worldMapOverlay.map(
    ({
      TextureName,
      MapArea,
      OffsetX,
      OffsetY,
      TextureWidth,
      TextureHeight,
    }) => ({
      TextureName: TextureName.toLowerCase(),
      MapArea: worldMapArea
        .find(({ ID }) => ID === MapArea)
        .AreaName.toLowerCase(),
      OverlayString: `${OffsetX},${OffsetY},${TextureWidth},${TextureHeight}`,
    }),
  )
  const groups = Object.groupBy(overlays, (o) => o.MapArea)
  const keys = Object.keys(groups)

  const dayt = keys.reduce((acc, key) => {
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

  const entries = Object.entries(groups).reduce((group, [key, value]) => {
    return (
      {
        ...group,
        [key]: value.reduce((agg, { TextureName, OverlayString }) => {
          return {
            ...agg,
            [TextureName]: OverlayString,
          }
        }, {}),
      },
      {}
    )
  })

  const luaContent = jsObjectToLuaPretty(dayt)

  const content = ["setfenv(1, SpwMap)", `SpwMap.Map.Overlay = ${luaContent}`]

  return content.join("\n")
}
