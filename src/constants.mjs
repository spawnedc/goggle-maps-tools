import path from "path"
import process from "process"

export const BASE_DIR = process.cwd()
export const EXPORT_DIR = path.join(BASE_DIR, "exports")

// See: https://wowdev.wiki/DB/AreaTable
export const IS_CITY_FLAG = 312
