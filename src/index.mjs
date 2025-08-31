import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { jsObjectToLuaPretty } from 'json_to_lua'

import { EXPORT_DIR } from './constants.mjs'
import { getInstanceInfo } from './tasks/getInstanceInfo.mjs'
import { getMapAreas } from './tasks/getMapAreas.mjs'
import { getMinimapBlocks } from './tasks/getMinimapBlocks.mjs'
import { getWorldMapOverlay } from './tasks/getZoneOverlays.mjs'

const LUA_DIR = join(EXPORT_DIR, 'lua')

const [, , copyTo] = process.argv

const namespace = 'GoggleMaps'

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

console.info('Instance info...')
const instanceInfo = getInstanceInfo(mapAreas)
const instanceInfoLuaContent = jsObjectToLuaPretty(instanceInfo)
const instanceInfoContent = [
  `setfenv(1, ${namespace})`,
  `${namespace}.Map.InstanceInfo = ${instanceInfoLuaContent}`,
]
writeFileSync(
  join(LUA_DIR, `Map.InstanceInfo.lua`),
  instanceInfoContent.join('\n'),
)
fileList.push(`Map.InstanceInfo.lua`)

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
  fileList.forEach((file) => {
    copyFileSync(join(LUA_DIR, file), join(copyTo, file))
  })
}

console.info('Done!')
