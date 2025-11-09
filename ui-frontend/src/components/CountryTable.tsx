import { ActionIcon, Badge, Card, Table, Text } from '@mantine/core'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CountrySummary } from '../api'

function badgeColor(value?: number | null) {
  const v = value ?? 0
  if (v >= 70) return 'teal'
  if (v >= 50) return 'yellow'
  return 'red'
}

export default function CountryTable({ data }: { data: CountrySummary[] }) {
  const navigate = useNavigate()
  const rows = useMemo(() => data.map((c) => (
    <Table.Tr key={c.iso_code} onClick={() => navigate(`/country/${c.iso_code}`)} style={{ cursor: 'pointer' }}>
      <Table.Td>{c.name}</Table.Td>
      <Table.Td>
        <Badge color={badgeColor(c.readiness_score)} variant="filled">
          {c.readiness_score?.toFixed?.(1) ?? 'N/A'}
        </Badge>
      </Table.Td>
      <Table.Td>{c.policy_score?.toFixed?.(1) ?? '—'}</Table.Td>
      <Table.Td>{c.infra_score?.toFixed?.(1) ?? '—'}</Table.Td>
      <Table.Td>{c.language_score?.toFixed?.(1) ?? '—'}</Table.Td>
      <Table.Td>{c.risk_score?.toFixed?.(1) ?? '—'}</Table.Td>
    </Table.Tr>
  )), [data, navigate])

  return (
    <Card shadow="xs" padding="md" radius="md">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Country</Table.Th>
            <Table.Th>Readiness</Table.Th>
            <Table.Th>Policy</Table.Th>
            <Table.Th>Infra</Table.Th>
            <Table.Th>Language</Table.Th>
            <Table.Th>Risk</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Card>
  )
}

