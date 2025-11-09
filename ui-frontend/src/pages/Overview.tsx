import { Grid, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { CountrySummary, fetchCountries } from '../api'
import Loading from '../components/Loading'
import CountryTable from '../components/CountryTable'
import MapPlaceholder from '../components/MapPlaceholder'
import TopBottomCards from '../components/TopBottomCards'

export default function Overview() {
  const [data, setData] = useState<CountrySummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCountries().then(setData).catch((e) => setError(String(e)))
  }, [])

  if (error) return <Text c="red">{error}</Text>
  if (!data) return <Loading />

  return (
    <Grid>
      <Grid.Col span={{ base: 12, lg: 7 }}>
        <CountryTable data={data} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 5 }}>
        <MapPlaceholder />
        <div style={{ height: 16 }} />
        <TopBottomCards data={data} />
      </Grid.Col>
    </Grid>
  )
}

