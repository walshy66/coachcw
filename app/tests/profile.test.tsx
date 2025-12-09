import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../src/pages/profile/ProfilePage';
import { calculateAgeFromDob } from '../src/services/date';
import {
  mockCanceledSubscription,
  mockOnHoldSubscription,
  mockSubscription,
  mockUserProfile,
} from '../src/services/mockData';
import { fetchSubscription, fetchUserProfile } from '../src/services/profile';

vi.mock('../src/services/profile', () => ({
  fetchUserProfile: vi.fn(),
  fetchSubscription: vi.fn(),
}));

const fetchUserProfileMock = vi.mocked(fetchUserProfile);
const fetchSubscriptionMock = vi.mocked(fetchSubscription);

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchUserProfileMock.mockResolvedValue(mockUserProfile);
    fetchSubscriptionMock.mockResolvedValue(mockSubscription);
  });

  it('renders profile info with initials fallback and age only', async () => {
    fetchUserProfileMock.mockResolvedValue({ ...mockUserProfile, avatarUrl: '' });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockUserProfile.fullName })).toBeInTheDocument();
    });

    expect(screen.getByText(`@${mockUserProfile.username}`)).toBeInTheDocument();
    expect(screen.getAllByText(mockUserProfile.email)[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/Initials avatar/i)).toHaveTextContent(mockUserProfile.avatarInitials ?? '');

    const age = calculateAgeFromDob(mockUserProfile.dateOfBirth);
    if (age !== null) {
      expect(screen.getByText(new RegExp(`${age} years`, 'i'))).toBeInTheDocument();
    }

    expect(screen.queryByLabelText(/Date of birth/i)).not.toBeInTheDocument();
  });

  it('recomputes age after saving a new date of birth', async () => {
    const user = userEvent.setup();

    render(<ProfilePage />);

    await screen.findByText(/^Age$/i);

    await user.click(screen.getByRole('button', { name: /edit date of birth/i }));
    const dobInput = await screen.findByLabelText(/Date of birth/i);
    await user.clear(dobInput);
    await user.type(dobInput, '2000-01-01');
    await user.click(screen.getByRole('button', { name: /save date/i }));

    const newAge = calculateAgeFromDob('2000-01-01');
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`${newAge} years`, 'i'))).toBeInTheDocument();
    });
  });

  it('handles missing date of birth gracefully', async () => {
    fetchUserProfileMock.mockResolvedValue({ ...mockUserProfile, dateOfBirth: null });

    render(<ProfilePage />);

    await screen.findByText(/^Age$/i);
    expect(screen.getByText(/Not provided/i)).toBeInTheDocument();
  });

  it('shows subscription states including on hold', async () => {
    fetchSubscriptionMock.mockResolvedValue(mockOnHoldSubscription);

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText(/Subscription/i)).toBeInTheDocument());
    expect(screen.getByText(/On hold/i)).toBeInTheDocument();
    expect(screen.getByText(/Not scheduled/i)).toBeInTheDocument();
  });

  it('shows canceled subscription state', async () => {
    fetchSubscriptionMock.mockResolvedValue(mockCanceledSubscription);

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByText(/Subscription/i)).toBeInTheDocument());
    expect(screen.getByText(/Canceled/i)).toBeInTheDocument();
    expect(screen.getByText(/No add-ons/i)).toBeInTheDocument();
  });

  it('shows friendly subscription error and placeholder messaging when unavailable', async () => {
    fetchSubscriptionMock.mockRejectedValue(new Error('network'));

    render(<ProfilePage />);

    await screen.findByText('Subscription info unavailable.');
    const placeholder = screen.getByText(/Payment details will be added soon/i);
    expect(placeholder).toHaveAttribute('aria-live', 'polite');
  });

  it('shows friendly profile error while falling back to saved info', async () => {
    fetchUserProfileMock.mockRejectedValue(new Error('fail'));

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/could not load your profile/i));
    expect(screen.getAllByText(mockUserProfile.fullName)[0]).toBeInTheDocument();
  });
});
