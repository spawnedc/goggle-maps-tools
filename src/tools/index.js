// 0. generate dbc schema from WDBX.Editor (generateDbcSchema.js)
// 1. extract DBCs and md5translate.trs from MPQs -> export-dbc.py TODO: convert to JS, also only required DBCs
// 2. convert DBCs to JSON -> node-dbc-reader
// 3. Should be able to do it with a clean install (no data and exports folders)

import { join } from 'node:path'
import { DBC_DIR, EXPORT_DIR } from '../constants.mjs'
import convertDbcToJson from './extractJsonFromDbc/index.js'
import { extractFileList, extractMPQ } from './extractMPQ.js'

const [, , wowPath, testFile] = process.argv

const dbcFilesToExtract = [
  'WorldMapContinent',
  'Map',
  'AreaTable',
  'WorldMapArea',
  'WorldMapOverlay',
]

const dbcPath = join(EXPORT_DIR, 'dbc')
const jsonPath = join(EXPORT_DIR, 'json')

const go = async () => {
  await extractMPQ(wowPath, 'dbc.MPQ', `${DBC_DIR}\\*`, dbcPath)
  await extractMPQ(
    wowPath,
    'texture.MPQ',
    'textures\\Minimap\\md5translate.trs',
    dbcPath,
  )

  await extractMPQ(wowPath, 'interface.MPQ', 'Interface\\WorldMap\\*', dbcPath)

  await convertDbcToJson(dbcFilesToExtract, {
    dbcPath: join(dbcPath, DBC_DIR),
    outDir: jsonPath,
  })
}

if (testFile) {
  await extractFileList(wowPath, `${testFile}.MPQ`, dbcPath)
} else {
  go()
}
