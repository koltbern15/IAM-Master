import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WarStory } from './WarStory'
import { ProTip } from './ProTip'
import { SC300Badge } from './SC300Badge'
import { Definition } from './Definition'

describe('callouts', () => {
  it('<WarStory> renders title + body inside a glass panel', () => {
    render(<WarStory title="Okta breach">Bad day.</WarStory>)
    expect(screen.getByText(/WAR STORY/)).toBeInTheDocument()
    expect(screen.getByText('Bad day.')).toBeInTheDocument()
  })

  it('<ProTip> renders amber tip label + content', () => {
    render(<ProTip>Read the docs first.</ProTip>)
    expect(screen.getByText(/PRO TIP/)).toBeInTheDocument()
    expect(screen.getByText('Read the docs first.')).toBeInTheDocument()
  })

  it('<SC300Badge> renders the SC-300 label', () => {
    render(<SC300Badge />)
    expect(screen.getByText('SC-300')).toBeInTheDocument()
  })

  it('<Definition> reveals tooltip on click', () => {
    render(<Definition term="KDC">Key Distribution Center.</Definition>)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('KDC'))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Key Distribution Center.')).toBeInTheDocument()
  })
})
