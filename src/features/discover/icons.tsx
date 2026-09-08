// Icônes de la page Découvrir (US-012) : dessinées pour ce projet, même
// convention que les icônes œil (COR-008) — trait "currentColor", pas de
// bibliothèque d'icônes, pas d'emoji. Toujours aria-hidden : le libellé
// visible à côté de chaque icône porte déjà le sens (jamais d'icône seule).
const commonProps = {
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
} as const;

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SearchIcon() {
  return (
    <svg {...commonProps}>
      <circle cx="10.5" cy="10.5" r="6.5" {...strokeProps} />
      <line x1="20" y1="20" x2="15.3" y2="15.3" {...strokeProps} />
    </svg>
  );
}

export function LocationIcon() {
  return (
    <svg {...commonProps}>
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" {...strokeProps} />
      <circle cx="12" cy="9.5" r="2.3" {...strokeProps} />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg {...commonProps}>
      <line x1="4" y1="6" x2="20" y2="6" {...strokeProps} />
      <line x1="4" y1="12" x2="20" y2="12" {...strokeProps} />
      <line x1="4" y1="18" x2="20" y2="18" {...strokeProps} />
      <circle cx="9" cy="6" r="2" {...strokeProps} fill="var(--color-bg-elevated)" />
      <circle cx="15" cy="12" r="2" {...strokeProps} fill="var(--color-bg-elevated)" />
      <circle cx="9" cy="18" r="2" {...strokeProps} fill="var(--color-bg-elevated)" />
    </svg>
  );
}

export function HeartIcon() {
  return (
    <svg {...commonProps}>
      <path
        d="M12 20.2s-7.6-4.6-9.9-9.3C.6 7.4 2.4 4 6 4c2.1 0 3.6 1.1 6 3.4C14.4 5.1 15.9 4 18 4c3.6 0 5.4 3.4 3.9 6.9-2.3 4.7-9.9 9.3-9.9 9.3Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...commonProps}>
      <line x1="12" y1="5" x2="12" y2="19" {...strokeProps} />
      <line x1="5" y1="12" x2="19" y2="12" {...strokeProps} />
    </svg>
  );
}

export function MessageIcon() {
  return (
    <svg {...commonProps}>
      <path
        d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4.5 4V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"
        {...strokeProps}
      />
    </svg>
  );
}

export function PersonIcon() {
  return (
    <svg {...commonProps}>
      <circle cx="12" cy="8.5" r="3.5" {...strokeProps} />
      <path d="M4.5 20c0-4.14 3.36-6.5 7.5-6.5s7.5 2.36 7.5 6.5" {...strokeProps} />
    </svg>
  );
}

export function CompassIcon() {
  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="9" {...strokeProps} />
      <path d="M15 9l-2 6-6 2 2-6 6-2Z" {...strokeProps} strokeLinejoin="round" />
    </svg>
  );
}

export function SortIcon() {
  return (
    <svg {...commonProps}>
      <line x1="6" y1="6" x2="6" y2="18" {...strokeProps} />
      <polyline points="3,9 6,6 9,9" {...strokeProps} />
      <line x1="18" y1="18" x2="18" y2="6" {...strokeProps} />
      <polyline points="15,15 18,18 21,15" {...strokeProps} />
    </svg>
  );
}
