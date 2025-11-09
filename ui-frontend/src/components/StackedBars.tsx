import { Card, Group, Progress, Text, Tooltip } from '@mantine/core'

type Props = {
  policy?: number | null
  infra?: number | null
  language?: number | null
  risk?: number | null
}

export default function StackedBars({ policy, infra, language, risk }: Props) {
  const values = [
    { value: (policy ?? 0), color: 'teal', label: 'Policy (0.4x)', tooltip: 'Signals from regulation & governance' },
    { value: (infra ?? 0), color: 'blue', label: 'Infra (0.3x)', tooltip: 'Compute, power, and supporting infra' },
    { value: (language ?? 0), color: 'grape', label: 'Language (0.2x)', tooltip: 'Language/knowledge sovereignty' },
    { value: (risk ?? 0), color: 'red', label: 'Risk (−0.1x)', tooltip: 'Inverse risk/uncertainty' }
  ]

  return (
    <Card shadow="xs" padding="md" radius="md">
      <Text fw={600} mb="xs">Score Components</Text>
      <Progress.Root size={24}>
        {values.map((s, idx) => (
          <Tooltip key={idx} label={s.tooltip} withArrow position="bottom">
            <Progress.Section value={s.value} color={s.color}>
              <Progress.Label>{s.label}</Progress.Label>
            </Progress.Section>
          </Tooltip>
        ))}
      </Progress.Root>
    </Card>
  )
}

