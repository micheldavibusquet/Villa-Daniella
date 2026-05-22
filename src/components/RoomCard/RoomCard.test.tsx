import { render, screen } from '@testing-library/react'
import RoomCard from './RoomCard'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))

describe('RoomCard component', () => {
  const mockRoom = {
    coverImage: {
      url: '/room.jpg',
    },

    images: [],
    name: 'Suíte Luxo',

    price: 450,

    type: 'casa',

    description: 'Quarto incrível com vista para o mar.',

    slug: {
      current: 'suite-luxo',
    },

    numberOfBeds: 2,

    dimension: 35,
  }

  it('renders room information correctly', () => {
    render(<RoomCard room={mockRoom as any} />)

    expect(
      screen.getByText('Suíte Luxo')
    ).toBeInTheDocument()

    expect(
      screen.getByText('R$ 450')
    ).toBeInTheDocument()

    expect(
      screen.getByText('RESERVAR')
    ).toBeInTheDocument()
  })
})