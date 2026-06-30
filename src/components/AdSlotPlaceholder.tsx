// src/components/AdSlotPlaceholder.tsx
interface AdSlotPlaceholderProps {
  variant: 'side' | 'bottom';
}

export function AdSlotPlaceholder({ variant }: AdSlotPlaceholderProps) {
  return (
    <aside className={`ad-slot ad-slot--${variant}`} aria-label="Publicidade">
      <span>Publicidade</span>
    </aside>
  );
}
