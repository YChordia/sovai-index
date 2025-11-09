import { AppShell, Group, Text } from '@mantine/core'
import { Routes, Route, Link } from 'react-router-dom'
import Overview from './pages/Overview'
import CountryDetail from './pages/CountryDetail'
import Compare from './pages/Compare'
import Methodology from './pages/Methodology'
import { API_BASE } from './api'

function Topbar() {
  return (
    <Group justify="space-between" px="md" py="sm" style={{ borderBottom: '1px solid #eee' }}>
      <Text fw={700}>SovAI Index – Sovereign AI Readiness Intelligence</Text>
      <Group gap="md">
        <Link to="/">Overview</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/methodology">Methodology</Link>
        <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer">API</a>
      </Group>
    </Group>
  )
}

function App() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Topbar />
      </AppShell.Header>
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/country/:iso" element={<CountryDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/methodology" element={<Methodology />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
