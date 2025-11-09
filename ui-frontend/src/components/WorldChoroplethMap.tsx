import { useCallback, useMemo, useState } from 'react'
import { Card, Group, Text, Paper, Badge } from '@mantine/core'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { CountrySummary } from '../api'

const TOPO_URL = (import.meta as any).env?.VITE_TOPO_URL || 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function colorFor(score?: number | null) {
  if (score == null) return '#e9ecef' // no data
  // Simple red -> yellow -> teal ramp
  if (score < 40) return '#fa5252'
  if (score < 60) return '#fab005'
  return '#12b886'
}

type HoverState = { name: string; iso: string; score?: number | null; x: number; y: number } | null

export default function WorldChoroplethMap({
  data,
  onCountryClick,
  geography,
}: {
  data: CountrySummary[]
  onCountryClick?: (iso: string) => void
  geography?: any
}) {
  const [hover, setHover] = useState<HoverState>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Build robust lookup supporting iso2 and iso3 country codes
  const EU_SET = new Set<string>([
    'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'
  ])

  const A3_TO_A2: Record<string, string> = {
    IND: 'IN', FRA: 'FR', DEU: 'DE', ITA: 'IT', ESP: 'ES', PRT: 'PT', NLD: 'NL', BEL: 'BE', LUX: 'LU', IRL: 'IE',
    DNK: 'DK', SWE: 'SE', FIN: 'FI', AUT: 'AT', POL: 'PL', CZE: 'CZ', SVK: 'SK', SVN: 'SI', HUN: 'HU', ROU: 'RO', BGR: 'BG',
    GRC: 'GR', HRV: 'HR', LTU: 'LT', LVA: 'LV', EST: 'EE', MLT: 'MT', CYP: 'CY', JPN: 'JP', KOR: 'KR', SAU: 'SA', SGP: 'SG', USA: 'US'
  }

  const NUM_TO_A2: Record<string, string> = {
    // Key ISO 3166-1 numeric (as string) -> ISO2
    '356': 'IN', '156': 'CN', '524': 'NP', '364': 'IR', '760': 'SY', '792': 'TR',
    '250': 'FR', '276': 'DE', '380': 'IT', '724': 'ES', '620': 'PT', '528': 'NL', '056': 'BE', '442': 'LU', '372': 'IE',
    '208': 'DK', '752': 'SE', '246': 'FI', '040': 'AT', '616': 'PL', '203': 'CZ', '703': 'SK', '705': 'SI', '348': 'HU',
    '642': 'RO', '100': 'BG', '300': 'GR', '191': 'HR', '440': 'LT', '428': 'LV', '233': 'EE', '470': 'MT', '196': 'CY',
    '392': 'JP', '410': 'KR', '682': 'SA', '702': 'SG', '840': 'US', '826': 'GB', '124': 'CA', '036': 'AU', '076': 'BR', '784': 'AE'
  }

  function isoFromFeature(geo: any): string {
    const props: any = geo?.properties || {}
    const iso2 = (props.ISO_A2 ?? props.iso_a2 ?? props.A2 ?? props.a2 ?? '').toString().toUpperCase()
    if (iso2 && iso2.length === 2) return iso2
    const iso3 = (props.ISO_A3 ?? props.iso_a3 ?? props.A3 ?? props.a3 ?? '').toString().toUpperCase()
    if (iso3 && A3_TO_A2[iso3]) return A3_TO_A2[iso3]
    const rawId = geo?.id ?? props.id
    if (rawId != null) {
      const idStr = String(rawId)
      if (/^\d{1,3}$/.test(idStr)) {
        const padded = idStr.padStart(3, '0')
        if (NUM_TO_A2[padded]) return NUM_TO_A2[padded]
      }
      const idUp = idStr.toUpperCase()
      if (idUp.length === 2) return idUp
      if (idUp.length === 3 && A3_TO_A2[idUp]) return A3_TO_A2[idUp]
    }
    return ''
  }

  const toIso2 = useCallback((code: string): string => {
    const up = (code || '').toUpperCase()
    if (up.length === 2) return up
    return A3_TO_A2[up] || up
  }, [])

  // Accept both iso2 and iso3 codes from the API
  const countryMap = useMemo(() => {
    const m = new Map<string, CountrySummary>()
    for (const c of data) {
      const iso = (c.iso_code || '').toUpperCase()
      if (!iso) continue
      m.set(iso, c)
      const iso2 = toIso2(iso)
      if (!m.has(iso2)) m.set(iso2, c)
    }
    return m
  }, [data, toIso2])
  const eu = countryMap.get('EU')
  const DEBUG = typeof window !== 'undefined' && (window as any).SOVAI_DEBUG === true
  const log = (...args: any[]) => {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[SOVAI]', ...args)
    }
  }
  return (
    <Card shadow="xs" padding="md" radius="md" h={360}>
      <Group justify="space-between" mb="xs">
        <Text fw={600}>Global Readiness Map</Text>
        <Group gap="sm">
          {eu?.readiness_score != null && (
            <Badge color="teal" variant="light" style={{ cursor: 'pointer' }} onClick={() => onCountryClick?.('EU')}>
              EU Readiness: {eu.readiness_score?.toFixed?.(1)}
            </Badge>
          )}
          <Text size="sm" c="dimmed">Click a country to view details</Text>
        </Group>
      </Group>
      <div style={{ position: 'relative', width: '100%', height: 300 }}>
        <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={300} style={{ width: '100%', height: '100%' }}>
          <Geographies geography={geography || TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const props: any = geo.properties || {}
                const iso = isoFromFeature(geo)
                const name =
                  (props.NAME_LONG as string) ||
                  (props.ADMIN as string) ||
                  (props.NAME as string) ||
                  (props.name as string) ||
                  ''
                const dataEntry = countryMap.get(iso) || (EU_SET.has(iso) ? eu : undefined)
                const score = dataEntry?.readiness_score
                const fill = colorFor(score)
                const clickable = !!(dataEntry)
                const displayName = EU_SET.has(iso) && eu ? 'European Union' : name
                const clickTarget = EU_SET.has(iso) && eu ? 'EU' : iso
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill, outline: 'none', cursor: clickable ? 'pointer' : 'default', stroke: '#fff', strokeWidth: 0.3 },
                      hover: { fill: clickable ? '#228be6' : fill, outline: 'none', cursor: clickable ? 'pointer' : 'default', stroke: '#fff', strokeWidth: 0.3 },
                      pressed: { fill: '#1971c2', outline: 'none', stroke: '#fff', strokeWidth: 0.3 },
                    }}
                    onMouseMove={(evt: any) => {
                      const info = { iso, name: displayName, target: clickTarget, score, rawId: geo?.id }
                      log('hover', info)
                      setDebugInfo(JSON.stringify(info))
                      setHover({ name: displayName, iso: clickTarget, score, x: evt.pageX, y: evt.pageY })
                    }}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => {
                      log('click', { iso, target: clickTarget, hasData: !!dataEntry })
                      if (clickable) onCountryClick?.(clickTarget)
                    }}
                  />
                )
              })
            }
          </Geographies>
          {/* EU overlay moved to top center to avoid map interference */}
        </ComposableMap>
        {/* EU overlay moved to header via Badge above */}
        {DEBUG && debugInfo && (
          <Paper shadow="sm" p="xs" radius="sm" style={{ position: 'absolute', left: 8, top: 8, background: '#fff' }}>
            <Text size="xs" c="dimmed">Debug</Text>
            <Text size="xs" style={{ maxWidth: 280, wordBreak: 'break-word' }}>{debugInfo}</Text>
          </Paper>
        )}
        {/* Floating hover card near cursor */}
        {hover && (
          <Paper shadow="lg" p="sm" radius="md" style={{ position: 'fixed', left: hover.x + 14, top: hover.y + 14, pointerEvents: 'none', zIndex: 1000, minWidth: 240, background: '#fff' }}>
            <Text fw={700} size="sm" c="black">{hover.name || hover.iso || 'Unknown'}</Text>
            <Text size="sm" c="black">{hover.score != null ? `Readiness: ${hover.score?.toFixed?.(1)}` : 'No data'}</Text>
          </Paper>
        )}
        {/* Removed persistent hover badge to reduce confusion */}
        <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 12, height: 12, background: '#fa5252', display: 'inline-block' }} />
          <Text size="xs">Low</Text>
          <span style={{ width: 12, height: 12, background: '#fab005', display: 'inline-block' }} />
          <Text size="xs">Medium</Text>
          <span style={{ width: 12, height: 12, background: '#12b886', display: 'inline-block' }} />
          <Text size="xs">High</Text>
        </div>
      </div>
    </Card>
  )
}
