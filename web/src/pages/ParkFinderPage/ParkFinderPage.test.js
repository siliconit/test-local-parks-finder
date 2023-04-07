import React from 'react'
import { render, screen } from '@redwoodjs/testing'
import ParkFinderPage from './ParkFinderPage'

describe('ParkFinderPage', () => {
  it('renders the page title', () => {
    render(<ParkFinderPage />);
    const pageTitle = screen.getByText(/Park Finder/i);
    expect(pageTitle).toBeInTheDocument();
  });

  it('renders the location input field', () => {
    render(<ParkFinderPage />)
    const locationInput = screen.getByLabelText(/enter your location/i)
    expect(locationInput).toBeInTheDocument()
  })

  // yarn rw test web/src/pages/ParkFinderPage/ParkFinderPage.test.js


  // add more tests here as needed
})