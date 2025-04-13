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
