import React from "react";
import EmptyState from "../common/EmptyState";
import { formatDate } from "../../utils/format";

export default function AnnouncementsWidget({ items = [] }) {
  if (items.length === 0) {
    return <EmptyState title="No announcements" description="Company announcements will be posted here." />;
  }

  return (
    <ul className="divide-y divide-divider-soft">
      {items.map((a) => (
        <li key={a._id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-caption-strong">{a.title}</p>
            <p className="text-fine-print text-ink-muted48 shrink-0">{formatDate(a.date)}</p>
          </div>
          <p className="text-caption text-ink-muted80 mt-0.5 line-clamp-2">{a.description}</p>
        </li>
      ))}
    </ul>
  );
}
