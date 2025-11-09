import { Badge, Card, Grid, Group, List, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CountryDetail as Detail, fetchCountry } from '../api'
import Loading from '../components/Loading'
import ScoreCard from '../components/ScoreCard'
import StackedBars from '../components/StackedBars'

export default function CountryDetail() {
  const { iso } = useParams()
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!iso) return
    fetchCountry(iso).then(setDetail).catch((e) => setError(String(e)))
  }, [iso])

  if (error) return <Text c="red">{error}</Text>
  if (!detail) return <Loading />

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="xl">{detail.name} ({detail.iso_code})</Text>
        {detail.computed_at && <Badge color="gray" variant="light">as of {new Date(detail.computed_at).toLocaleString()}</Badge>}
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ScoreCard label="Readiness Score" value={detail.readiness_score} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <StackedBars
            policy={detail.policy_score}
            infra={detail.infra_score}
            language={detail.language_score}
            risk={detail.risk_score}
          />
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="xs" padding="md" radius="md">
            <Text fw={600} mb="xs">How this score is calculated</Text>
            <Text size="sm" c="dimmed">Weights and equations</Text>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(detail.methodology, null, 2)}</pre>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="xs" padding="md" radius="md">
            <Text fw={600} mb="xs">Key Sovereign AI Signals</Text>
            {detail.policies.map((p) => (
              <div key={p.id} style={{ marginBottom: 12 }}>
                <Text fw={500}>{p.name}</Text>
                <List>
                  {p.indicators.map((ind, idx) => (
                    <List.Item key={idx}>
                      <code>{ind.key}</code> = <code>{String(ind.value)}</code>
                      {ind.source_url && (
                        <>
                          {' '}• <a href={ind.source_url} target="_blank" rel="noreferrer">source</a>
                        </>
                      )}
                    </List.Item>
                  ))}
                </List>
              </div>
            ))}
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  )
}
