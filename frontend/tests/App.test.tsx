import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../src/App'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = axios as vi.Mocked<typeof axios>

describe('Mission Control Dashboard - Full Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1. Data Ingestion: Displays telemetry records from the API', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: [{ id: '1', satelliteId: 'VOYAGER-1', altitude: 500, velocity: 7.5, status: 'healthy', timestamp: new Date().toISOString() }] }
    })

    render(<App />)
    
    // Verify the satellite ID appears in the table
    const record = await screen.findByText(/VOYAGER-1/i)
    expect(record).toBeInTheDocument()
  })

  it('2. Ground Safety: Blocks invalid (negative) altitude injection', async () => {
    render(<App />)
    
    const altInput = screen.getByLabelText(/ALTITUDE/i)
    const submitBtn = screen.getByText(/TRANSMIT PACKET/i)

    // Act: Enter a negative number
    fireEvent.change(altInput, { target: { value: '-100' } })
    
    // Create a mock for the window.alert that the code uses for validation errors
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    fireEvent.click(submitBtn)

    // Assert: Ensure the API was NEVER called because the UI blocked it
    expect(mockedAxios.post).not.toHaveBeenCalled()
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("must be positive"))
  })

  it('3. Mission Command: Sends a valid telemetry packet', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } })
    mockedAxios.post.mockResolvedValueOnce({ status: 200 })

    render(<App />)

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText(/e.g. VOYAGER-1/i), { target: { value: 'SAT-X' } })
    fireEvent.change(screen.getByLabelText(/ALTITUDE/i), { target: { value: '250' } })
    fireEvent.change(screen.getByLabelText(/VELOCITY/i), { target: { value: '8' } })
    
    fireEvent.click(screen.getByText(/TRANSMIT PACKET/i))

    await waitFor(() => {
      // Verify the POST was sent with the correct payload structure
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String), 
        expect.objectContaining({ satelliteId: 'SAT-X', altitude: 250 })
      )
    })
  })
})
