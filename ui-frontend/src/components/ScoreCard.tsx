import { Card, Group, Text } from '@mantine/core'

export default function ScoreCard({ label, value }: { label: string; value?: number | null }) {
  return (
    <Card shadow="xs" padding="md" radius="md">
      <Group justify="space-between">
        <Text c="dimmed">{label}</Text>
        <Text fw={700} size="xl">{value?.toFixed?.(1) ?? 'N/A'}</Text>
      </Group>
    </Card>
  )
}

