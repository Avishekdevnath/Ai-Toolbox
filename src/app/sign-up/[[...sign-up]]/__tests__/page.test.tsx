import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '../page';

const mockReplace = jest.fn();
const mockUseAuth = jest.fn();
const mockRegister = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
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
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ available: true }),
    });

    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/first name/i), 'Ava');
    await user.type(screen.getByLabelText(/last name/i), 'Rahman');
    await user.type(screen.getByLabelText(/username/i), 'avarahman');
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/check-username'));
    });
    await user.type(screen.getByLabelText(/^email$/i), 'ava@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPassword123');
    await user.type(screen.getByLabelText(/^confirm password$/i), 'StrongPassword123');

    await user.selectOptions(screen.getByLabelText(/security question 1/i), 'childhood_nickname');
    await user.type(screen.getByLabelText(/answer 1/i), 'Sunny');
    await user.selectOptions(screen.getByLabelText(/security question 2/i), 'favorite_food');
    await user.type(screen.getByLabelText(/answer 2/i), 'Biryani');

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByText(/complete at least 3 security questions/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
