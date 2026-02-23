import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../src/App'
import axios from 'axios'

// Mock the API call so tests don't need the backend running
vi.mock('axios')

describe('Mission Control Dashboard', () => {
  it('renders the header and syncing status', () => {
    render(<App />)
    expect(screen.getByText(/MISSION CONTROL/i)).toBeInTheDocument()
    expect(screen.getByText(/SYNCHRONIZING BUFFER/i)).toBeInTheDocument()
  })

  it('displays an error message when the ground station link fails', async () => {
    // Force an API failure
    (axios.get as any).mockRejectedValueOnce(new Error('Link Failure'))
    render(<App />)
    const errorMessage = await screen.findByText(/Ground Station Offline/i)
    expect(errorMessage).toBeInTheDocument()
  })
})
