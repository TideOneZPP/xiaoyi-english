const exactAbbreviations = [
  [/\bUK\b/g, 'U K'],
  [/\bUSA\b/g, 'U S A'],
  [/\bUS\b/g, 'U S'],
  [/\bPE\b/g, 'P E'],
  [/\bTV\b/g, 'T V'],
  [/\bCD\b/g, 'C D'],
  [/\bAI\b/g, 'A I'],
  [/\bOK\b/g, 'okay'],
]

const calendarAbbreviations = [
  [/\bMon\.?(?=\s|$|[,;:!?])/gi, 'Monday'],
  [/\bTue(?:s)?\.?(?=\s|$|[,;:!?])/gi, 'Tuesday'],
  [/\bWed\.?(?=\s|$|[,;:!?])/gi, 'Wednesday'],
  [/\bThu(?:r|rs)?\.?(?=\s|$|[,;:!?])/gi, 'Thursday'],
  [/\bFri\.?(?=\s|$|[,;:!?])/gi, 'Friday'],
  [/\bSat\.?(?=\s|$|[,;:!?])/gi, 'Saturday'],
  [/\bSun\.?(?=\s|$|[,;:!?])/gi, 'Sunday'],
  [/\bJan\.?(?=\s|$|[,;:!?]|\d)/gi, 'January'],
  [/\bFeb\.?(?=\s|$|[,;:!?]|\d)/gi, 'February'],
  [/\bMar\.?(?=\s|$|[,;:!?]|\d)/gi, 'March'],
  [/\bApr\.?(?=\s|$|[,;:!?]|\d)/gi, 'April'],
  [/\bJun\.?(?=\s|$|[,;:!?]|\d)/gi, 'June'],
  [/\bJul\.?(?=\s|$|[,;:!?]|\d)/gi, 'July'],
  [/\bAug\.?(?=\s|$|[,;:!?]|\d)/gi, 'August'],
  [/\bSep(?:t)?\.?(?=\s|$|[,;:!?]|\d)/gi, 'September'],
  [/\bOct\.?(?=\s|$|[,;:!?]|\d)/gi, 'October'],
  [/\bNov\.?(?=\s|$|[,;:!?]|\d)/gi, 'November'],
  [/\bDec\.?(?=\s|$|[,;:!?]|\d)/gi, 'December'],
]

function measurement(text, unit, singular, plural) {
  const pattern = new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*${unit}\\b`, 'gi')
  return text.replace(pattern, (_, value) => `${value} ${Number(value) === 1 ? singular : plural}`)
}

export function prepareSpeechText(text) {
  let prepared = text
    .replace(/\bMrs\.?(?=\s|$|[,;:!?])/gi, 'Missus')
    .replace(/\bMr\.?(?=\s|$|[,;:!?])/gi, 'Mister')
    .replace(/\bMs\.?(?=\s|$|[,;:!?])/gi, 'Miz')
    .replace(/\bDr\.?(?=\s|$|[,;:!?])/gi, 'Doctor')
    .replace(/\bNo\.?(?=\s*\d)/gi, 'Number')
    .replace(/\b(?:a\.m|A\.M)\.(?=\s+[A-Z]|$)/g, 'A M.')
    .replace(/\b(?:p\.m|P\.M)\.(?=\s+[A-Z]|$)/g, 'P M.')
    .replace(/\ba\.m\.?(?=\s|$|[,;:!?])/gi, 'A M')
    .replace(/\bp\.m\.?(?=\s|$|[,;:!?])/gi, 'P M')
    .replace(/(\d+(?:\.\d+)?)\s*°\s*C\b/gi, '$1 degrees Celsius')

  prepared = measurement(prepared, 'kg', 'kilogram', 'kilograms')
  prepared = measurement(prepared, 'km', 'kilometre', 'kilometres')
  prepared = measurement(prepared, 'cm', 'centimetre', 'centimetres')
  prepared = measurement(prepared, 'g', 'gram', 'grams')

  for (const [pattern, replacement] of calendarAbbreviations) prepared = prepared.replace(pattern, replacement)
  for (const [pattern, replacement] of exactAbbreviations) prepared = prepared.replace(pattern, replacement)
  return prepared
}
