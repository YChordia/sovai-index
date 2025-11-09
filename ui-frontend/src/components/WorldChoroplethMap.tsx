import { useMemo, useState } from 'react'
import { Card, Group, Text, Box, Paper } from '@mantine/core'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { CountrySummary } from '../api'

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

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
}: {
  data: CountrySummary[]
  onCountryClick?: (iso: string) => void
}) {
  const [hover, setHover] = useState<HoverState>(null)
  const lookup = useMemo(() => {
    const m = new Map<string, CountrySummary>()
    for (const c of data) m.set(c.iso_code.toUpperCase(), c)
    return m
  }, [data])

  return (
    <Card shadow="xs" padding="md" radius="md" h={360}>
      <Group justify="space-between" mb="xs">
        <Text fw={600}>Global Readiness (Choropleth)</Text>
        <Text size="sm" c="dimmed">Click a country to view details</Text>
      </Group>
      <div style={{ position: 'relative', width: '100%', height: 300 }}>
        <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={300} style={{ width: '100%', height: '100%' }}>
          <Geographies geography={TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const iso = (geo.properties.ISO_A2 as string || '').toUpperCase()
                const name = (geo.properties.NAME as string) || ''
                const match = lookup.get(iso)
                const score = match?.readiness_score
                const fill = colorFor(score)
                const clickable = !!match
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill, outline: 'none', cursor: clickable ? 'pointer' : 'default', stroke: '#fff', strokeWidth: 0.3 },
                      hover: { fill: clickable ? '#228be6' : fill, outline: 'none', cursor: clickable ? 'pointer' : 'default', stroke: '#fff', strokeWidth: 0.3 },
                      pressed: { fill: '#1971c2', outline: 'none', stroke: '#fff', strokeWidth: 0.3 },
                    }}
                    onMouseMove={(evt: any) => setHover({ name, iso, score, x: evt.clientX, y: evt.clientY })}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => { if (clickable) onCountryClick?.(iso) }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
        {hover && (
          <Paper shadow="md" p="xs" radius="sm" style={{ position: 'fixed', left: hover.x + 12, top: hover.y + 12, pointerEvents: 'none', zIndex: 1000 }}>
            <Text fw={600} size="sm">{hover.name}</Text>
            {hover.score != null && <Text size="sm">Readiness: {hover.score?.toFixed?.(1)}</Text>}
          </Paper>
        )}
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
