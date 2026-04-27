type SemanticTone = 'good' | 'caution' | 'danger' | 'info'

type SemanticTermGroup = {
  tone: SemanticTone
  terms: string[]
}

type SemanticHighlightProps = {
  children: string | number | null | undefined
}

const semanticTermGroups: SemanticTermGroup[] = [
  {
    tone: 'danger',
    terms: [
      'active warning',
      'active warnings',
      'afternoon watch',
      'alert',
      'amaran aktif',
      'heavy rain',
      'lightning',
      'risk returns',
      'road spray',
      'severe',
      'skip',
      'slippery',
      'storm risk',
      'storm',
      'storms',
      'thunder',
      'thunderclouds',
      'thunderstorm',
      'thunderstorms',
      'visibility drops',
      'warning',
      'warnings',
      'amaran',
      'gagal',
      'kilat',
      'kurang baik',
      'ralat',
      'ribut',
      'risiko',
      'tangguh',
    ],
  },
  {
    tone: 'caution',
    terms: [
      'caution',
      'cloud build-up',
      'cloud cover',
      'clouding',
      'clouds',
      'drizzle',
      'haze',
      'humid',
      'humidity',
      'late afternoon',
      'mist',
      'monitor',
      'rain builds',
      'rain chance',
      'rain probability',
      'rain signal',
      'rain window',
      'rain',
      'showers',
      'watch',
      'berhati-hati',
      'hujan',
      'kelembapan',
      'pantau',
      'sederhana',
      'waktu hujan',
      'waspada',
    ],
  },
  {
    tone: 'good',
    terms: [
      'best dry window',
      'clear warning state',
      'comfortable',
      'dry window',
      'no location-specific warning is active',
      '0 active warnings',
      'safest',
      'workable',
      'keadaan amaran selamat',
      'selamat',
      'selesa',
      'teruskan',
      'tiada amaran',
      '0 amaran aktif',
    ],
  },
  {
    tone: 'info',
    terms: [
      'aqi',
      'api cache ttl',
      'cache',
      'confidence',
      'forecast',
      'hiking',
      'keyakinan',
      'ramalan',
      'ttl',
    ],
  },
]

const termToneByText = new Map(
  semanticTermGroups.flatMap(({ tone, terms }) =>
    terms.map((term) => [term.toLowerCase(), tone] as const),
  ),
)

const semanticTermPattern = new RegExp(
  semanticTermGroups
    .flatMap(({ terms }) => terms)
    .sort((first, second) => second.length - first.length)
    .map(escapeRegExp)
    .join('|'),
  'gi',
)

const termBoundaryPattern = /[\p{L}\p{N}]/u

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isTermBoundary(value: string | undefined) {
  return !value || !termBoundaryPattern.test(value)
}

function isWholeTermMatch(text: string, startIndex: number, term: string) {
  return (
    isTermBoundary(text[startIndex - 1]) &&
    isTermBoundary(text[startIndex + term.length])
  )
}

export function SemanticHighlight({ children }: SemanticHighlightProps) {
  if (children === null || children === undefined || children === '') {
    return null
  }

  const text = String(children)
  const highlightedParts: Array<string | { text: string; tone: SemanticTone }> = []
  let currentIndex = 0

  for (const match of text.matchAll(semanticTermPattern)) {
    const matchedText = match[0]
    const matchIndex = match.index

    if (matchIndex === undefined || !isWholeTermMatch(text, matchIndex, matchedText)) {
      continue
    }

    if (matchIndex > currentIndex) {
      highlightedParts.push(text.slice(currentIndex, matchIndex))
    }

    const tone = termToneByText.get(matchedText.toLowerCase())

    if (tone) {
      highlightedParts.push({ text: matchedText, tone })
    } else {
      highlightedParts.push(matchedText)
    }

    currentIndex = matchIndex + matchedText.length
  }

  if (currentIndex < text.length) {
    highlightedParts.push(text.slice(currentIndex))
  }

  if (highlightedParts.length === 0) {
    return text
  }

  return (
    <>
      {highlightedParts.map((part, index) => {
        if (typeof part === 'string') {
          return part
        }

        return (
          <span key={`${part.text}-${index}`} className={`semantic-term semantic-term-${part.tone}`}>
            {part.text}
          </span>
        )
      })}
    </>
  )
}
