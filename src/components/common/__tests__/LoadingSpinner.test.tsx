import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    const customText = 'Loading data...'
    render(<LoadingSpinner text={customText} />)
    expect(screen.getByText(customText)).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('status')
    expect(spinner.querySelector('svg')).toHaveClass('w-4', 'h-4')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('status')
    expect(spinner.querySelector('svg')).toHaveClass('w-8', 'h-8')
  })

  it('applies custom className', () => {
    const customClass = 'custom-spinner-class'
    render(<LoadingSpinner className={customClass} />)
    const container = screen.getByRole('status').parentElement
    expect(container).toHaveClass(customClass)
  })
}) 