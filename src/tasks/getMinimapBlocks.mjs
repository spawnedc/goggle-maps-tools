import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { EXPORT_DIR, MINIMAP_DIR } from '../constants.mjs'

export const getMinimapBlocks = () => {
  const contents = readFileSync(
    join(EXPORT_DIR, 'dbc', MINIMAP_DIR, 'md5translate.trs'),
    { encoding: 'utf-8' },
  )

  const supportedMaps = ['Azeroth', 'Kalimdor']

  const minimapBlocks = {}

  let currentDir

  contents
    .replace(/\r\n/g, '\n')
    .split('\n')
    .forEach((line) => {
      if (line.startsWith('dir: ')) {
        const dirName = line.replace('dir: ', '')
        if (supportedMaps.includes(dirName)) {
          currentDir = dirName
          minimapBlocks[currentDir] = {}
        } else {
          currentDir = undefined
        }
      } else if (currentDir && supportedMaps.includes(currentDir)) {
        if (!minimapBlocks[currentDir]) {
          minimapBlocks[currentDir] = {}
        }

        const [mapName, texture] = line.split('\t')

        const coordinates = mapName
          .replace(`${currentDir}\\map`, '')
          .replace('.blp', '')

        const coordinateId = coordinates
          .split('_')
          .map((n) => parseInt(n, 10))
          .map((n) => (n < 10 ? `0${n}` : `${n}`))
          .join('')

        try {
          minimapBlocks[currentDir][coordinateId] = texture
            .replace('.blp', '')
            .replace('\\', '\\\\')
        } catch {
          // empty line
          console.info('error')
        }
      }
    })

  return minimapBlocks
}
