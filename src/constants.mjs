import path from 'node:path'
import process from 'node:process'

export const BASE_DIR = process.cwd()
export const EXPORT_DIR = path.join(BASE_DIR, 'exports')

export const DBC_DIR = 'DBFilesClient'
export const MINIMAP_DIR = 'textures/Minimap'

// See: https://wowdev.wiki/DB/AreaTable
export const IS_CITY_FLAG = 9 // 0x00000100 = 256 = 2 ^ 8 = indexes start from 0, hence 9. I know.
export const IS_ARENA_FLAG = 7

export const MAP_WIDTH = 1002
export const MAP_HEIGHT = 668

export const INSTANCE_CONTINENT_ID = 50
export const RAID_CONTINENT_ID = 60
export const BATTLEGROUND_CONTINENT_ID = 70
