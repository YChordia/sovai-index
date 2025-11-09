import { Card, Grid, Group, MultiSelect, Text } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { CountrySummary, fetchCompare, fetchCountries } from '../api'
import Loading from '../components/Loading'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Compare() {
  const [all, setAll] = useState<CountrySummary[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [data, setData] = useState<CountrySummary[] | null>(null)

  useEffect(() => {
    fetchCountries().then(setAll)
  }, [])

  useEffect(() => {
    if (!selected.length) { setData([]); return }
    fetchCompare(selected).then(setData)
  }, [selected])

  const options = all.map((c) => ({ value: c.iso_code, label: `${c.name} (${c.iso_code})` }))

  const chartData = useMemo(() => (data || []).map((c) => ({
    iso: c.iso_code,
    policy: c.policy_score ?? 0,
    infra: c.infra_score ?? 0,
    language: c.language_score ?? 0
  })), [data])

  const insight = useMemo(() => {
    if (!data || data.length < 2) return ''
    const [a, b] = data
    const stronger = (x?: number | null, y?: number | null) => (x ?? 0) >= (y ?? 0)
    const parts: string[] = []
    if (stronger(a.policy_score, b.policy_score)) parts.push(`${a.iso_code} stronger in policy`)
    else parts.push(`${b.iso_code} stronger in policy`)
    if (stronger(a.infra_score, b.infra_score)) parts.push(`${a.iso_code} stronger in infra`)
    else parts.push(`${b.iso_code} stronger in infra`)
    if (stronger(a.language_score, b.language_score)) parts.push(`${a.iso_code} stronger in language`)
    else parts.push(`${b.iso_code} stronger in language`)
    return parts.join(', ')
  }, [data])

  return (
    <div>
      <Group mb="md">
        <MultiSelect
          data={options}
          placeholder="Select countries to compare"
          value={selected}
          onChange={setSelected}
          withinPortal
        />
      </Group>

      {!data ? <Loading /> : (
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card shadow="xs" padding="md" radius="md" h={360}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="iso" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="policy" fill="#12b886" name="Policy" />
                  <Bar dataKey="infra" fill="#228be6" name="Infra" />
                  <Bar dataKey="language" fill="#ae3ec9" name="Language" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="xs" padding="md" radius="md">
              <Text fw={600} mb="xs">Interpretation</Text>
              <Text size="sm" c="dimmed">{insight || 'Select 2+ countries for a quick comparison.'}</Text>
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </div>
  )
}

