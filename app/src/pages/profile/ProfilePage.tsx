import { useEffect, useMemo, useState } from 'react';
import './ProfilePage.css';
import { fetchSubscription, fetchUserProfile } from '../../services/profile';
import { calculateAgeFromDob, formatFullDate } from '../../services/date';
import type { Subscription, UserProfile } from '../../services/types';
import { mockUserProfile } from '../../services/mockData';
import NavLinks from '../../components/navigation/NavLinks';

function getInitials(name?: string) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const statusLabels: Record<Subscription['status'], string> = {
  active: 'Active',
  on_hold: 'On hold',
  canceled: 'Canceled',
};

const statusClasses: Record<Subscription['status'], string> = {
  active: 'status--active',
  on_hold: 'status--hold',
  canceled: 'status--canceled',
};

type ProfilePageProps = {
  onNavigate?: (page: 'landing' | 'profile' | 'session' | 'program') => void;
};

function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [editingDob, setEditingDob] = useState(false);
  const [dobInput, setDobInput] = useState('');
  const [dobError, setDobError] = useState<string | null>(null);

  const age = useMemo(() => calculateAgeFromDob(profile?.dateOfBirth), [profile?.dateOfBirth]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const data = await fetchUserProfile();
      setProfile({ ...data, avatarInitials: data.avatarInitials ?? getInitials(data.fullName) });
      setDobInput(data.dateOfBirth ?? '');
    } catch (err) {
      console.warn('Profile unavailable, falling back to mock', err);
      setProfile({ ...mockUserProfile, avatarInitials: getInitials(mockUserProfile.fullName) });
      setDobInput(mockUserProfile.dateOfBirth ?? '');
      setProfileError('We could not load your profile right now. Showing saved info.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadSubscription = async () => {
    setLoadingSubscription(true);
    setSubscriptionError(null);
    try {
      const data = await fetchSubscription();
      setSubscription(data);
    } catch (err) {
      console.warn('Subscription unavailable', err);
      setSubscription(null);
      setSubscriptionError('Subscription info unavailable right now.');
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadSubscription();
  }, []);

  const handleSaveDob = () => {
    setDobError(null);
    if (!dobInput) {
      setProfile((prev) => (prev ? { ...prev, dateOfBirth: null } : prev));
      setEditingDob(false);
      return;
    }

    const updatedAge = calculateAgeFromDob(dobInput);
    if (updatedAge === null) {
      setDobError('Please enter a valid past date.');
      return;
    }

    setProfile((prev) => (prev ? { ...prev, dateOfBirth: dobInput } : prev));
    setEditingDob(false);
  };

  const resetDobEdit = () => {
    setEditingDob(false);
    setDobError(null);
    setDobInput(profile?.dateOfBirth ?? '');
  };

  const renderAvatar = () => {
    if (profile?.avatarUrl) {
      return <img src={profile.avatarUrl} alt={`${profile.fullName} avatar`} />;
    }
    return <span aria-label="Initials avatar">{profile?.avatarInitials ?? getInitials(profile?.fullName)}</span>;
  };

  const renderSubscriptionContent = () => {
    if (loadingSubscription) {
      return <p className="profile__muted">Loading subscription...</p>;
    }

    if (!subscription) {
      return (
        <div className="profile__card">
          <p className="profile__muted">Subscription info unavailable.</p>
          {subscriptionError && (
            <p className="profile__muted" role="status">
              {subscriptionError}
            </p>
          )}
          <div
            className="subscription__placeholder"
            aria-live="polite"
            aria-label="Payment management notice"
          >
            Payment details will be added soon. You will manage payment methods here in a future update.
          </div>
        </div>
      );
    }

    const statusLabel = statusLabels[subscription.status];
    const statusClass = statusClasses[subscription.status];
    const memberSince = formatFullDate(subscription.memberSince);
    const renewal = formatFullDate(subscription.renewalDate);

    return (
      <div className="profile__card">
        <div className="subscription__row">
          <div>
            <p className="label">Plan</p>
            <p className="value">{subscription.planName}</p>
          </div>
          <span className={`subscription__status ${statusClass}`}>{statusLabel}</span>
        </div>

        <div className="subscription__grid">
          <div>
            <p className="label">Member since</p>
            <p className="value">{memberSince || 'Not available'}</p>
          </div>
          <div>
            <p className="label">Next renewal</p>
            <p className="value">{renewal || 'Not scheduled'}</p>
          </div>
          <div>
            <p className="label">Sessions per {subscription.period ?? 'month'}</p>
            <p className="value">{subscription.sessionsPerPeriod ?? 0}</p>
          </div>
          <div>
            <p className="label">Auto-renew</p>
            <p className="value">{subscription.autoRenew ? 'On' : 'Off'}</p>
          </div>
        </div>

        <div className="subscription__addons">
          <p className="label">Add-ons</p>
          {subscription.addOns && subscription.addOns.length > 0 ? (
            <ul>
              {subscription.addOns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="value">No add-ons</p>
          )}
        </div>

        <div
          className="subscription__placeholder"
          aria-live="polite"
          aria-label="Payment management notice"
        >
          Payment details will be added soon. You will manage payment methods here in a future update.
        </div>
      </div>
    );
  };

  return (
    <main className="profile">
      <header className="profile__page-header">
        <div>
          <p className="eyebrow">Client profile</p>
          <h1>Profile</h1>
          <p className="profile__subhead">Update your details and membership.</p>
        </div>
        <div className="profile__nav">
          <NavLinks
            onNavigate={(target) => {
              if (target === 'overview') onNavigate?.('landing');
              if (target === 'profile') onNavigate?.('profile');
              if (target === 'sessions') onNavigate?.('session');
              if (target === 'program') onNavigate?.('program');
            }}
          />
        </div>
      </header>
      <header className="profile__header">
        <div className="profile__avatar">{renderAvatar()}</div>
        <div>
          <p className="eyebrow">Profile</p>
          <h1>{profile?.fullName ?? 'Your profile'}</h1>
          <div className="profile__meta">
            <span>{profile?.username ? `@${profile.username}` : 'username unavailable'}</span>
            <span className="pill">{profile?.role ?? 'Role not set'}</span>
          </div>
          <p className="profile__muted">{profile?.email ?? 'Email unavailable'}</p>
          <p className="profile__muted">{profile?.location ?? 'Location not provided'}</p>
        </div>
      </header>

      {profileError && (
        <div className="profile__alert" role="status">
          {profileError}
        </div>
      )}

      <section className="profile__grid">
        <div className="panel profile__panel">
          <div className="panel__title">About you</div>
          {loadingProfile ? (
            <p className="profile__muted">Loading profile...</p>
          ) : (
            <div className="profile__card">
              <div className="profile__row">
                <div>
                  <p className="label">Name</p>
                  <p className="value">{profile?.fullName}</p>
                </div>
                <div>
                  <p className="label">Email</p>
                  <p className="value">{profile?.email}</p>
                </div>
                <div>
                  <p className="label">Location</p>
                  <p className="value">{profile?.location ?? 'Not provided'}</p>
                </div>
              </div>

              <div className="profile__dob">
                <div>
                  <p className="label">Age</p>
                  <p className="value">{age !== null ? `${age} years` : 'Not provided'}</p>
                </div>
                <button className="button" onClick={() => setEditingDob((prev) => !prev)}>
                  {editingDob ? 'Save DOB' : 'Edit date of birth'}
                </button>
              </div>

              {editingDob && (
                <div className="profile__dob-edit">
                  <label htmlFor="dob-input">Date of birth</label>
                  <input
                    id="dob-input"
                    type="date"
                    value={dobInput}
                    onChange={(e) => setDobInput(e.target.value)}
                  />
                  {dobError && (
                    <p className="profile__field-error" role="alert">
                      {dobError}
                    </p>
                  )}
                  <div className="profile__actions">
                    <button className="button button--primary" onClick={handleSaveDob}>
                      Save date
                    </button>
                    <button className="button button--ghost" onClick={resetDobEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="panel profile__panel">
          <div className="panel__title">Subscription</div>
          {renderSubscriptionContent()}
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;
