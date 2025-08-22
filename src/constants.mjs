import path from 'path'
import process from 'process'

export const BASE_DIR = process.cwd()
export const EXPORT_DIR = path.join(BASE_DIR, 'exports')

// See: https://wowdev.wiki/DB/AreaTable
export const IS_CITY_FLAG = 9 // 0x00000100 = 256 = 2 ^ 8 = indexes start from 0, hence 9. I know.

export const MAP_WIDTH = 1002
export const MAP_HEIGHT = 668
