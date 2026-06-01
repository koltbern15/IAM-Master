import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SailPointAggregationDiagram } from './SailPointAggregationDiagram'

describe('SailPointAggregationDiagram', () => {
  it('renders the SailPoint IGA data-flow nodes', () => {
    render(<SailPointAggregationDiagram />)
    expect(screen.getByText('SOURCES')).toBeInTheDocument()
    expect(screen.getByText('AGGREGATE')).toBeInTheDocument()
    expect(screen.getByText('CORRELATE')).toBeInTheDocument()
    expect(screen.getByText('IDENTITY')).toBeInTheDocument()
    expect(screen.getByText('REQUEST')).toBeInTheDocument()
    expect(screen.getByText('CERTIFY')).toBeInTheDocument()
  })

  it('renders the aggregation → certification step labels', () => {
    render(<SailPointAggregationDiagram />)
    expect(screen.getByText('Aggregate')).toBeInTheDocument()
    expect(screen.getByText('Correlate')).toBeInTheDocument()
    expect(screen.getByText('Certification')).toBeInTheDocument()
  })

  it('reveals the correlation detail when Correlate is clicked', () => {
    render(<SailPointAggregationDiagram />)
    fireEvent.click(screen.getByRole('button', { name: /Correlate/i }))
    expect(screen.getByText(/uncorrelated|orphan|matches each/i)).toBeInTheDocument()
  })
})
