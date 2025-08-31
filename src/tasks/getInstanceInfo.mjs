import { EXPORT_DIR, INSTANCE_CONTINENT_ID } from '../constants.mjs'
import { readdirSync, lstatSync } from 'fs'
import { join } from 'path'

const getInstanceFolders = () => {
  const baseDir = join(EXPORT_DIR, 'dbc', 'Interface', 'WorldMap')
  const entries = readdirSync(baseDir)
  return entries
    .filter((entry) => {
      const stats = lstatSync(join(baseDir, entry))
      return stats.isDirectory()
    })
    .map((entry) => entry.toLowerCase())
}

export const getInstanceInfo = (mapAreas) => {
  const folders = getInstanceFolders()
  const allAreas = Object.entries(mapAreas)
    .map(([key, value]) => ({
      ...value,
      spwMapId: parseInt(key, 10),
    }))
    .filter((a) => a.overlay)
    .toSorted((a, b) => a.name.localeCompare(b.name))

  const instanceAreas = allAreas.filter((area) => {
    const minMapId = INSTANCE_CONTINENT_ID * 1000
    // includes instance, raid and battleground maps
    return area.spwMapId >= minMapId
  })

  const instanceInfo = instanceAreas
    .map((instance) => {
      const instanceFolders = folders.filter((f) =>
        f.startsWith(instance.overlay),
      )
      const unusedFolders = instanceFolders.filter(
        (f) => !allAreas.find((i) => i.overlay === f),
      )
      unusedFolders.unshift(instance.overlay)

      return {
        spwMapId: instance.spwMapId,
        floors: unusedFolders.map((folder, index) => ({
          x: 0,
          y: index * -100,
          overlay: folder,
        })),
      }
    })
    .reduce((acc, cur) => {
      acc[cur.spwMapId] = cur.floors
      return acc
    }, {})

  return instanceInfo
}
