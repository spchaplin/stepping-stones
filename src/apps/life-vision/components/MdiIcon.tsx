import React from 'react';

type MdiIconName = 'star-shooting' | 'map' | 'compass-rose';

const PATHS: Record<MdiIconName, string> = {
  'star-shooting':
    'm18.09 11.77l1.47 6.33L14 14.74L8.44 18.1l1.46-6.33L5 7.5l6.47-.54L14 1l2.53 5.96L23 7.5zM2 12.43c.19 0 .38-.06.55-.17l3.2-2.11l-1.57-1.36l-2.73 1.8c-.461.3-.589.91-.29 1.41c.2.27.52.43.84.43m-.84 9.12c.2.29.52.45.84.45c.19 0 .38-.05.55-.16l4.11-2.71l.34-1.37l.31-1.45l-5.86 3.85c-.461.31-.589.93-.29 1.39m.29-6.17a1 1 0 0 0-.29 1.38c.2.3.52.45.84.45c.19 0 .38-.05.55-.16l5.42-3.55l.27-1.19l-.92-.81z',
  map: 'm15 19l-6-2.11V5l6 2.11M20.5 3h-.16L15 5.1L9 3L3.36 4.9c-.21.07-.36.25-.36.48V20.5a.5.5 0 0 0 .5.5c.05 0 .11 0 .16-.03L9 18.9l6 2.1l5.64-1.9c.21-.1.36-.25.36-.48V3.5a.5.5 0 0 0-.5-.5',
  'compass-rose':
    'm15 9l-3-9l-3 9l-9 3l9 3l3 9l3-9l9-3zM4 12l6-2l1 2zm8 8l-2-6l2-1zm0-16l2 6l-2 1zm2 10l-1-2h7zm-5.3 3.3L5 19l1.7-3.7l1.6.5zm8.6-2L19 19l-3.7-1.7l.5-1.6zM6.7 8.7L5 5l3.7 1.7l-.5 1.5zm8.6-2L19 5l-1.7 3.7l-1.6-.5z',
};

interface MdiIconProps {
  name: MdiIconName;
  size: number;
  className?: string;
}

export default function MdiIcon({ name, size, className }: MdiIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
