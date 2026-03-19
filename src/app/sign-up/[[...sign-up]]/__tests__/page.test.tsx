import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '../page';

const mockPush = jest.fn();
const mockUseAuth = jest.fn();
const mockRegister = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/components/Navigation', () => function NavigationMock() {
  return <div data-testid="navigation" />;
});

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      register: mockRegister,
    });
    (global.fetch as jest.Mock).mockReset();
  });

  it('blocks signup until at least 3 question rows are completed', async () => {
    const user = userEvent.setup();

    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/first name/i), 'Ava');
    await user.type(screen.getByLabelText(/last name/i), 'Rahman');
    await user.type(screen.getByLabelText(/username/i), 'avarahman');
    await user.type(screen.getByLabelText(/^email$/i), 'ava@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123');
    await user.type(screen.getByLabelText(/^confirm password$/i), 'StrongPassword123');

    await user.selectOptions(screen.getByLabelText(/security question 1/i), 'childhood_nickname');
    await user.type(screen.getByLabelText(/answer 1/i), 'Sunny');
    await user.selectOptions(screen.getByLabelText(/security question 2/i), 'favorite_food');
    await user.type(screen.getByLabelText(/answer 2/i), 'Biryani');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/complete at least 3 security questions/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
