import { readFileSync } from "fs"
import { join } from "path"

export const getMinimapBlocks = () => {
  const contents = readFileSync(
    join(process.cwd(), "data/textures/Minimap/md5translate.trs"),
    {
      encoding: "utf-8",
    },
  )

  const supportedMaps = ["Azeroth", "Kalimdor"]

  const minimapBlocks = {}

  let currentDir

  contents.split("\n").forEach((line) => {
    if (line.startsWith("dir: ")) {
      console.info(line)
      const dirName = line.replace("dir: ", "")
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

      const [mapName, texture] = line.split("\t")

      const coordinateId = mapName
        .replace(`${currentDir}\\map`, "")
        .replace(".blp", "")
        .replace("_", "")

      try {
        minimapBlocks[currentDir][coordinateId] = texture.replace(".blp", "")
      } catch {
        // empty line
      }
    }
  })

  return minimapBlocks
}
