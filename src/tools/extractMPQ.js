import { readdir } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { BASE_DIR } from '../constants.mjs'

const BASE_COMMAND = `${BASE_DIR}/bin/MPQExtractor`

const getPatchFiles = async (dataDir) => {
  const files = await readdir(dataDir)
  const patchFiles = files
    .filter((f) => f.toLowerCase().startsWith('patch'))
    .map((f) => join(dataDir, f))
  const mainPatch = patchFiles.pop()
  patchFiles.unshift(mainPatch)

  return patchFiles
}

/**
 * Exports files from MPQ files
 * @param {string} dataDir Wow Data directory where the MPQ files are stored
 * @param {string} dbcFile DBC file name to extract. It shouldn't be an absolute path
 * @param {string | string[]} filesToExport Pattern of files to be exported e.g. "DBFilesClient\\*"
 * @param {string} exportDir Directory to export the files to
 * @param {boolean} keepFolderStructure Whether to keep folder structure or not. Default is false
 */
const extractMPQ = async (
  dataDir,
  dbcFile,
  filesToExport,
  exportDir,
  keepFolderStructure,
) => {
  const patchFiles = await getPatchFiles(dataDir)
  const exportList = Array.isArray(filesToExport)
    ? filesToExport
    : [filesToExport]
  const command = [
    BASE_COMMAND,
    `"${join(dataDir, dbcFile)}"`,
    `-o ${exportDir}`,
    ...exportList.map((f) => `-e "${f}"`),
    ...patchFiles.map((p) => `-p "${p}"`),
  ]

  if (keepFolderStructure) {
    command.push('-f')
  }

  if (!existsSync(exportDir)) {
    mkdirSync(exportDir, { recursive: true })
  }

  console.info('Extracting from', dbcFile, '...')
  execSync(command.join(' \\\n\t'))
}

export default extractMPQ
