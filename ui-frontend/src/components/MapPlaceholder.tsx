import { Card, Center, Text } from '@mantine/core'

export default function MapPlaceholder() {
  return (
    <Card shadow="xs" padding="xl" radius="md" h={320}>
      <Center h="100%">
        <Text c="dimmed">World map placeholder (shade by readiness)</Text>
      </Center>
    </Card>
  )
}

