import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordChangeModal from '../PasswordChangeModal';

describe('PasswordChangeModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('supports both current-password and security-question verification methods', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { rerender } = render(
      <PasswordChangeModal
        isOpen={true}
        onClose={jest.fn()}
        userEmail="ava@example.com"
      />
    );

    await user.click(screen.getByRole('radio', { name: /current password/i }));
    await user.type(screen.getByLabelText(/^current password$/i), 'CurrentPassword123');
    await user.type(screen.getByLabelText(/^new password$/i), 'NewStrongPassword123');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'NewStrongPassword123');
    await user.click(screen.getByRole('button', { name: /^update password$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/change-password/update',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            newPassword: 'NewStrongPassword123',
            verification: {
              method: 'current_password',
              currentPassword: 'CurrentPassword123',
            },
          }),
        })
      );
    });

    (global.fetch as jest.Mock).mockReset();
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

    rerender(
      <PasswordChangeModal
        isOpen={true}
        onClose={jest.fn()}
        userEmail="ava@example.com"
      />
    );

    await user.click(screen.getByRole('radio', { name: /security questions/i }));
    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(
      await screen.findByLabelText(/what was your childhood nickname\?/i)
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/what was your childhood nickname\?/i), 'Sunny');
    await user.type(screen.getByLabelText(/what is your favorite food\?/i), 'Biryani');
    await user.click(screen.getByRole('button', { name: /verify answers/i }));

    await user.type(screen.getByLabelText(/^new password$/i), 'AnotherStrongPassword123');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'AnotherStrongPassword123');
    await user.click(screen.getByRole('button', { name: /^update password$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        '/api/user/change-password/challenge',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        '/api/user/change-password/verify-questions',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        '/api/user/change-password/update',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            newPassword: 'AnotherStrongPassword123',
            verification: {
              method: 'security_questions',
              challengeId: 'challenge-1',
            },
          }),
        })
      );
    });
  });
});
