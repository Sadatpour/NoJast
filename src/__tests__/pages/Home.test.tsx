import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders main content', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders navigation', () => {
    render(<Home />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<Home />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
}) 