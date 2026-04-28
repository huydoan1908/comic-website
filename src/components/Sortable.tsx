import { useSortable } from '@dnd-kit/react/sortable';
import { ReactNode } from 'react';

interface SortableProps {
  children: ReactNode;
  id: string | number;
  index: number;
}

export default function Sortable({ children, id, index }: SortableProps) {
  const { ref } = useSortable({ id, index });

  return (
    <div ref={ref} className="sortable-item">{children}</div>
  );
}