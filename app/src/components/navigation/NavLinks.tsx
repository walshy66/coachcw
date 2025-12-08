import './NavLinks.css';

type BadgeCounts = Partial<Record<'program' | 'sessions' | 'exercises' | 'messages' | 'reports', number>>;

const baseLinks = [
  { id: 'program', label: 'Program', url: '/program' },
  { id: 'sessions', label: 'Sessions', url: '/sessions' },
  { id: 'exercises', label: 'Exercises', url: '/exercises' },
  { id: 'messages', label: 'Messages', url: '/messages' },
  { id: 'reports', label: 'Reports', url: '/reports' },
];

function NavLinks({ badges = {} }: { badges?: BadgeCounts }) {
  return (
    <nav className="nav" aria-label="Primary navigation">
      {baseLinks.map((link) => {
        const count = badges[link.id as keyof BadgeCounts];
        const showBadge = !!count && count > 0;
        const badgeText = count && count > 9 ? '9+' : count?.toString();
        return (
          <a key={link.id} className="nav__link" href={link.url} aria-label={`${link.label}${showBadge ? ` (${badgeText} alerts)` : ''}`}>
            <span>{link.label}</span>
            {showBadge && <span className="nav__badge">{badgeText}</span>}
          </a>
        );
      })}
    </nav>
  );
}

export default NavLinks;
