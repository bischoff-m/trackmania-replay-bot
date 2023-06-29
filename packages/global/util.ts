/**
 * Converts a duration like 27513 ms into a string like "0:27.513". The format
 * is "hhh:mm:ss.SSS" with the hours being optional and arbitrarily long.
 * @param millis Time of a record.
 */
export function formatTrackmaniaTime(millis: number): string {
  const hours = Math.floor(millis / 1000 / 60 / 60)
  const minutes = Math.floor(millis / 1000 / 60) % 60
  const seconds = Math.floor(millis / 1000) % 60
  const milliseconds = Math.floor(millis % 1000)
  const hoursString = hours ? `${hours}:` : ''
  const minutesString = minutes
  const secondsString = `${seconds}`.padStart(2, '0')
  const millisecondsString = `${milliseconds}`.padStart(3, '0')
  return `${hoursString}${minutesString}:${secondsString}.${millisecondsString}`
}

/**
 * Calculates the delta between two times and formats it like "+0:00.000".
 * @param timeMillis If this is bigger than referenceMillis, the delta will be positive.
 * @param referenceMillis The time to compare timeMillis to.
 * @returns String representation of the delta.
 */
export function formatTrackmaniaDelta(
  timeMillis: number,
  referenceMillis: number
): string {
  const deltaMillis = timeMillis - referenceMillis
  const sign = deltaMillis < 0 ? '-' : '+'
  const delta = Math.abs(deltaMillis)
  return `${sign}${formatTrackmaniaTime(delta)}`
}
