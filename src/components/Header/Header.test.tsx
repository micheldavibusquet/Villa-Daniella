import { render, screen } from '@testing-library/react'
import Header from './Header'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
  }),
  signOut: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({
    data: null,
  }),
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => ({
    darkTheme: false,
    setDarkTheme: jest.fn(),
  }),
}))

describe('Header component', () => {
  it('renders navigation links correctly', () => {
    render(<Header />)

    expect(
      screen.getByText('Início')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Acomodações')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Entrar')
    ).toBeInTheDocument()
  })
})