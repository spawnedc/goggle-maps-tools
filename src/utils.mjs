export const removeKeyFromObject = (obj, key) => {
  const copy = { ...obj }
  delete copy[key]

  return copy
}
export const arrayByObjecKey = (array, key, removeKey) =>
  array.reduce(
    (agg, obj) => ({
      ...agg,
      [obj[key]]: removeKey ? removeKeyFromObject(obj, key) : obj,
    }),
    {},
  )

export const floatToPrecision = (number, precision) => {
  const adjuster = Math.pow(10, precision)
  return Math.round(number * adjuster) / adjuster
}

// According to carbonite, LocLeft: y1, LocRight: y2, LocTop: x1, LocBottom: x2
// Data comes from WorldMapArea.dbc
export const getXYScale = ({ LocLeft, LocRight, LocTop, LocBottom }) => {
  const scale = (-LocRight + LocLeft) / 500
  const x = -LocLeft / 5
  const y = -LocTop / 5

  return {
    scale: floatToPrecision(scale, 4),
    x: floatToPrecision(x, 4),
    y: floatToPrecision(y, 4),
  }
}
