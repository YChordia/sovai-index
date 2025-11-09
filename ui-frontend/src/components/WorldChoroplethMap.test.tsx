import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import WorldChoroplethMap from './WorldChoroplethMap'
import { MantineProvider } from '@mantine/core'

const GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { NAME_LONG: 'India' },
      id: '356',
      geometry: { type: 'Polygon', coordinates: [[[0,0],[1,0],[1,1],[0,1],[0,0]]]},
    },
    {
      type: 'Feature',
      properties: { ISO_A3: 'FRA', NAME_LONG: 'France' },
      geometry: { type: 'Polygon', coordinates: [[[2,0],[3,0],[3,1],[2,1],[2,0]]]},
    },
  ],
}

const DATA = [
  { iso_code: 'IN', name: 'India', readiness_score: 60, policy_score: 70, infra_score: 55, language_score: 70, risk_score: 40 },
  { iso_code: 'EU', name: 'European Union', readiness_score: 65 },
]

test('hover shows name and score; click fires callback', async () => {
  const onClick = vi.fn()
  const { container } = render(
    <MantineProvider defaultColorScheme="light">
      <WorldChoroplethMap data={DATA as any} onCountryClick={onClick} geography={GEOJSON as any} />
    </MantineProvider>
  )

  const paths = container.querySelectorAll('path')
  expect(paths.length).toBeGreaterThan(0)

  const indiaPath = paths[0]
  fireEvent.mouseMove(indiaPath, { clientX: 100, clientY: 100, pageX: 100, pageY: 100 })

  // Hover card renders text (scope by value to avoid EU header badge match)
  expect(screen.getByText(/India/i)).toBeInTheDocument()
  const indiaReadinessEls = screen.getAllByText(/Readiness:/i)
  expect(indiaReadinessEls.some((el) => /60\.0/.test(el.textContent || ''))).toBe(true)

  fireEvent.click(indiaPath)
  expect(onClick).toHaveBeenCalledWith('IN')
  // Hover FR (EU member) shows EU mapping
  const francePath = paths[1]
  fireEvent.mouseMove(francePath, { clientX: 120, clientY: 110, pageX: 120, pageY: 110 })
  expect(screen.getByText(/European Union/i)).toBeInTheDocument()
  const euReadinessEls = screen.getAllByText(/Readiness:/i)
  expect(euReadinessEls.some((el) => /65\.0/.test(el.textContent || ''))).toBe(true)
})
