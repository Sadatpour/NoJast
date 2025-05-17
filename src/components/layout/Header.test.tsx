import { render, screen } from '@testing-library/react'
import { Header } from './Header'
import { User } from '@supabase/supabase-js'

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock the useLanguage hook
jest.mock('@/components/LanguageProvider', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: 'fa'
  })
}))

describe('Header', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    created_at: '',
    aud: '',
    role: '',
    updated_at: null,
    app_metadata: {},
    user_metadata: {},
    identities: [],
    factors: []
  }

  it('renders logo and tagline', () => {
    render(<Header user={null} />)
    
    expect(screen.getByAltText('نوجست')).toBeInTheDocument()
    expect(screen.getByText('نو ( New ) + جَست ( Search )')).toBeInTheDocument()
  })

  it('renders search bar', () => {
    render(<Header user={null} />)
    
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument()
  })

  it('renders login/signup buttons when user is not logged in', () => {
    render(<Header user={null} />)
    
    expect(screen.getByText('login')).toBeInTheDocument()
    expect(screen.getByText('signup')).toBeInTheDocument()
  })

  it('renders user navigation when user is logged in', () => {
    render(<Header user={mockUser} />)
    
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })

  it('renders contact and submit product buttons', () => {
    render(<Header user={null} />)
    
    expect(screen.getByText('ارتباط با ما')).toBeInTheDocument()
    expect(screen.getByText('ثبت محصول')).toBeInTheDocument()
  })
}) 