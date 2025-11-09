import { Grid, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { CountrySummary, fetchCountries } from '../api'
import Loading from '../components/Loading'
import CountryTable from '../components/CountryTable'
import { useNavigate } from 'react-router-dom'
import WorldChoroplethMap from '../components/WorldChoroplethMap'
import TopBottomCards from '../components/TopBottomCards'

export default function Overview() {
  const [data, setData] = useState<CountrySummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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
        <WorldChoroplethMap data={data} onCountryClick={(iso) => navigate(`/country/${iso}`)} />
        <div style={{ height: 16 }} />
        <TopBottomCards data={data} />
      </Grid.Col>
    </Grid>
  )
}
