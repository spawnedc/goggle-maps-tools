import { existsSync, writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { jsObjectToLuaPretty } from 'json_to_lua'
import { join, resolve } from 'path'

import { EXPORT_DIR } from './constants.mjs'
import { getMapAreas } from './tasks/getMapAreas.mjs'
import { getWorldMapOverlay } from './tasks/getZoneOverlays.mjs'
import { getMinimapBlocks } from './tasks/getMinimapBlocks.mjs'

const LUA_DIR = join(EXPORT_DIR, 'lua')

const [, , namespace = 'SpwMap', copyTo] = process.argv

if (!existsSync(LUA_DIR)) {
  mkdirSync(LUA_DIR, { recursive: true })
}

const fileList = []

console.info('Map areas...')
const mapAreas = getMapAreas()
const mapAreasLuaContent = jsObjectToLuaPretty(mapAreas)
const mapAreasContent = [
  `setfenv(1, ${namespace})`,
  `${namespace}.Map.Area = ${mapAreasLuaContent}`,
]
writeFileSync(join(LUA_DIR, `Map.Area.lua`), mapAreasContent.join('\n'))
fileList.push(`Map.Area.lua`)

console.info('Map overlays...')
const { overlays, hotspots } = getWorldMapOverlay(mapAreas)
const overlaysLuaContent = jsObjectToLuaPretty(overlays)
const overlaysContent = [
  `setfenv(1, ${namespace})`,
  `${namespace}.Map.Overlay = ${overlaysLuaContent}`,
]
writeFileSync(join(LUA_DIR, `Map.Overlay.lua`), overlaysContent.join('\n'))
fileList.push(`Map.Overlay.lua`)

const hotspotsLuaContent = jsObjectToLuaPretty(hotspots)
const hotspotsContent = [
  `setfenv(1, ${namespace})`,
  `${namespace}.Map.Hotspots = ${hotspotsLuaContent}`,
]
writeFileSync(join(LUA_DIR, `Map.Hotspots.lua`), hotspotsContent.join('\n'))
fileList.push(`Map.Hotspots.lua`)

console.info('Minimap blocks...')
const minimapBlocks = getMinimapBlocks()
const minimapBlocksLuaContent = jsObjectToLuaPretty(minimapBlocks)
const minimapBlocksContent = [
  `setfenv(1, ${namespace})`,
  `${namespace}.Map.MinimapBlocks = ${minimapBlocksLuaContent}`,
]
writeFileSync(
  join(LUA_DIR, `Map.MinimapBlocks.lua`),
  minimapBlocksContent.join('\n'),
)
fileList.push(`Map.MinimapBlocks.lua`)

if (copyTo && existsSync(copyTo)) {
  fileList.forEach((file) =>
    copyFileSync(join(LUA_DIR, file), join(copyTo, file)),
  )
}

console.info('Done!')
