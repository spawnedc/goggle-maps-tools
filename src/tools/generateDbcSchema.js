import { readFileSync, writeFileSync } from 'fs'
import { xml2js } from 'xml-js'

import { BASE_DIR } from '../constants.mjs'

const generateDbcSchema = () => {
  const definitions = readFileSync(
    `${BASE_DIR}/bin/WDBX.Editor/Definitions/Classic 1.12.1 (5875).xml`,
    { encoding: 'utf8' },
  )

  const result = xml2js(definitions, { compact: true, spaces: 2 })

  const tables = result.Definition.Table

  const tableData = tables.reduce((acc, curr) => {
    return {
      ...acc,
      [curr._attributes.Name]: Array.isArray(curr.Field)
        ? curr.Field.map((field) => {
            if (field._attributes.ArraySize) {
              return [
                ...Array(parseInt(field._attributes.ArraySize, 10)).keys(),
              ].map((index) => ({
                name: `${field._attributes.Name}_${index + 1}`,
                type: field._attributes.Type,
              }))
            }
            return {
              name: field._attributes.Name,
              type: field._attributes.Type,
            }
          }).flat()
        : [],
    }
  }, {})

  const schemaFolder = `${BASE_DIR}/src/tools/extractJsonFromDbc/schemas/vanilla`

  Object.entries(tableData).forEach(([tableName, tableFields]) => {
    writeFileSync(
      `${schemaFolder}/${tableName.toLowerCase()}.json`,
      JSON.stringify(tableFields, null, 2),
    )
  })
}

export default generateDbcSchema
