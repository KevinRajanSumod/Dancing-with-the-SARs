interface SnapshotBadgeProps {
  source?: 'Snapshot' | 'Live';
}

export default function SnapshotBadge({ source = 'Snapshot' }: SnapshotBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-canvas px-3 py-1 text-xs font-semibold text-navy">
      <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
      FIRMS data {source.toLowerCase()}
    </span>
  );
}
