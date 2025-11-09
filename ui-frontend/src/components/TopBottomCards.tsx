import { Card, Grid, List, Text } from '@mantine/core'
import type { CountrySummary } from '../api'

export default function TopBottomCards({ data }: { data: CountrySummary[] }) {
  const sorted = [...data].sort((a, b) => (b.readiness_score ?? 0) - (a.readiness_score ?? 0))
  const top5 = sorted.slice(0, 5)
  const bottom5 = sorted.slice(-5).reverse()
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card shadow="xs" padding="md" radius="md">
          <Text fw={600} mb="xs">Top 5</Text>
          <List>
            {top5.map((c) => (
              <List.Item key={c.iso_code}>{c.name} — {c.readiness_score?.toFixed?.(1) ?? 'N/A'}</List.Item>
            ))}
          </List>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card shadow="xs" padding="md" radius="md">
          <Text fw={600} mb="xs">Bottom 5</Text>
          <List>
            {bottom5.map((c) => (
              <List.Item key={c.iso_code}>{c.name} — {c.readiness_score?.toFixed?.(1) ?? 'N/A'}</List.Item>
            ))}
          </List>
        </Card>
      </Grid.Col>
    </Grid>
  )
}

