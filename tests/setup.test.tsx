import { render } from '@testing-library/react'
import App from '../src/App'

describe('Project Setup', () => {
  it('should render the App component without errors', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
