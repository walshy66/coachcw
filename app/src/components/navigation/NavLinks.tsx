import type { MouseEvent } from 'react';
import './NavLinks.css';

type BadgeKey = 'program' | 'sessions' | 'exercises' | 'messages' | 'reports';
type BadgeCounts = Partial<Record<BadgeKey, number>>;
type NavLinkId = BadgeKey | 'profile' | 'overview';

type NavLink = {
  id: NavLinkId;
  label: string;
  url: string;
};

const baseLinks: NavLink[] = [
  { id: 'overview', label: 'Overview', url: '/' },
  { id: 'program', label: 'Program', url: '/program' },
  { id: 'sessions', label: 'Sessions', url: '/sessions' },
  { id: 'exercises', label: 'Exercises', url: '/exercises' },
  { id: 'messages', label: 'Messages', url: '/messages' },
  { id: 'reports', label: 'Reports', url: '/reports' },
  { id: 'profile', label: 'Profile', url: '#profile' },
];

type NavLinksProps = {
  badges?: BadgeCounts;
  onNavigate?: (target: NavLinkId) => void;
};

function NavLinks({ badges = {}, onNavigate }: NavLinksProps) {
  return (
    <nav className="nav" aria-label="Primary navigation">
      {baseLinks.map((link) => {
        const count = (badges as Record<string, number | undefined>)[link.id];
        const showBadge = !!count && count > 0;
        const badgeText = count && count > 9 ? '9+' : count?.toString();
        const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
          if ((link.id === 'profile' || link.id === 'overview') && onNavigate) {
            event.preventDefault();
            onNavigate(link.id);
          }
        };

        return (
          <a
            key={link.id}
            className="nav__link"
            href={link.url}
            aria-label={`${link.label}${showBadge ? ` (${badgeText} alerts)` : ''}`}
            onClick={(link.id === 'profile' || link.id === 'overview') && onNavigate ? handleClick : undefined}
          >
            <span>{link.label}</span>
            {showBadge && <span className="nav__badge">{badgeText}</span>}
          </a>
        );
      })}
    </nav>
  );
}

export default NavLinks;
