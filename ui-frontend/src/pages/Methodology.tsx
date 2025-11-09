import { Card, List, Text, Title, Table, Code, Stack, Anchor } from '@mantine/core'
import { useEffect, useState } from 'react'
import { fetchMethodology, type Methodology } from '../api'
import Loading from '../components/Loading'

export default function Methodology() {
  const [data, setData] = useState<Methodology | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMethodology().then(setData).catch((e) => setError(String(e)))
  }, [])

  if (error) return <Text c="red">{error}</Text>
  if (!data) return <Loading />

  const weights = data.weights || {}
  const equations = data.equations || {}

  return (
    <Stack gap="md">
      <Title order={3}>Methodology</Title>
      <Card shadow="xs" padding="md" radius="md">
        <Text fw={600} mb="xs">Inputs</Text>
        <List>
          {data.inputs?.map((i: string, idx: number) => <List.Item key={idx}>{i}</List.Item>)}
        </List>
      </Card>

      <Card shadow="xs" padding="md" radius="md">
        <Text fw={600} mb="xs">Weights</Text>
        <Table withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Component</Table.Th>
              <Table.Th>Weight</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Object.entries(weights).map(([k, v]: [string, any]) => (
              <Table.Tr key={k}>
                <Table.Td>{k}</Table.Td>
                <Table.Td>{typeof v === 'number' ? v.toFixed(2) : String(v)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Card shadow="xs" padding="md" radius="md">
        <Text fw={600} mb="xs">Equations</Text>
        {Object.entries(equations).map(([k, v]: [string, any]) => (
          <div key={k} style={{ marginBottom: 8 }}>
            <Text c="dimmed" size="sm">{k}</Text>
            <Code block>{String(v)}</Code>
          </div>
        ))}
      </Card>

      <Card shadow="xs" padding="md" radius="md">
        <Text fw={600} mb="xs">Notes</Text>
        <List>
          {data.notes?.map((n: string, idx: number) => <List.Item key={idx}>{n}</List.Item>)}
        </List>
        <Text size="sm" c="dimmed" mt="sm">
          API docs: <Anchor href="/docs" target="_blank">/docs</Anchor>
        </Text>
      </Card>
    </Stack>
  )
}
