import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '../page';

jest.mock('@/components/Navbar', () => function NavbarMock() {
  return <div data-testid="navbar" />;
});

jest.mock('@/components/NewFooter', () => function NewFooterMock() {
  return <div data-testid="footer" />;
});

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('moves forgot-password from identifier to questions to new password', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          challengeId: 'challenge-1',
          questions: [
            {
              questionId: 'childhood_nickname',
              label: 'What was your childhood nickname?',
            },
            {
              questionId: 'favorite_food',
              label: 'What is your favorite food?',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/email or username/i), 'ava@example.com');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByText(/answer your security questions/i)
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/what was your childhood nickname\?/i), 'Sunny');
    await user.type(screen.getByLabelText(/what is your favorite food\?/i), 'Biryani');
    await user.click(screen.getByRole('button', { name: /verify answers/i }));

    expect(await screen.findByText(/create a new password/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^new password$/i), 'NewStrongPassword123');
    await user.type(screen.getByLabelText(/confirm new password/i), 'NewStrongPassword123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        '/api/auth/forgot-password/challenge',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        '/api/auth/forgot-password/verify',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        '/api/auth/forgot-password/reset',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    expect(
      await screen.findByText(/password reset successfully/i)
    ).toBeInTheDocument();
  });
});
