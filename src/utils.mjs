export const removeKeyFromObject = (obj, key) => {
  const copy = { ...obj }
  delete copy[key]

  return copy
}
export const arrayByObjecKey = (array, key, removeKey) =>
  array.reduce((agg, obj) => {
    agg[obj[key]] = removeKey ? removeKeyFromObject(obj, key) : obj
    return agg
  }, {})

export const floatToPrecision = (number, precision) => {
  const adjuster = 10 ** precision
  return Math.round(number * adjuster) / adjuster
}

// According to carbonite, LocLeft: y1, LocRight: y2, LocTop: x1, LocBottom: x2
// Data comes from WorldMapArea.dbc
export const getXYScale = ({ LocLeft, LocRight, LocTop }) => {
  const scale = (-LocRight + LocLeft) / 500
  const x = -LocLeft / 5
  const y = -LocTop / 5

  return {
    scale: floatToPrecision(scale, 4),
    x: floatToPrecision(x, 4),
    y: floatToPrecision(y, 4),
  }
}

const flags = []
for (let i = 0; i < 32; i++) {
  flags.push(2 ** i)
}

export const getFlagsFromMask = (mask) => {
  const maskValues = []
  const maskIndexes = []
  let newMask = mask
  while (newMask > 0) {
    const maskIndex = flags.findIndex((flag) => flag > newMask) - 1
    const maskValue = flags[maskIndex]
    newMask -= maskValue
    maskValues.push(maskValue)
    maskIndexes.push(maskIndex + 1)
  }

  return maskIndexes
}

export const hasFlag = (mask, flag) => {
  const flags = getFlagsFromMask(mask)
  return flags.includes(flag)
}
