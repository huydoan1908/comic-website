import React from 'react';
import { Button } from './Button';

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  options?: number[];
}

export function ItemsPerPageSelector({
  itemsPerPage,
  onItemsPerPageChange,
  options = [10, 15, 20, 25, 30]
}: ItemsPerPageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Show:</span>
      <div className="flex gap-1">
        {options.map((option) => (
          <Button
            key={option}
            variant={itemsPerPage === option ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onItemsPerPageChange(option)}
            className="min-w-[40px]"
          >
            {option}
          </Button>
        ))}
      </div>
      <span className="text-sm text-gray-700">per page</span>
    </div>
  );
}
