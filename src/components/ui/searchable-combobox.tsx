import * as React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Input } from './input';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  name: string;
}

interface SearchableComboboxProps {
  options: Option[];
  selected: string;
  onSelect: (id: string) => void;
  placeholder?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  options,
  selected,
  onSelect,
  placeholder,
}) => {
  const [query, setQuery] = React.useState('');
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="w-full h-10 relative border border-border rounded-md cursor-pointer px-2 py-1 bg-background text-sm flex items-center justify-between"
          role="button"
        >
          <span className="truncate flex-1 text-left">
            {options.find((option) => option.id === selected)?.name ||
              'Select meal'}
          </span>
          <Search className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-2" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Input
          placeholder={placeholder || 'Search...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <ul className="max-h-40 overflow-auto">
          {filteredOptions.map((option) => (
            <li
              key={option.id}
              className={cn(
                'p-2 flex items-center cursor-pointer hover:bg-muted rounded-sm',
                option.id === selected && 'bg-muted'
              )}
              onClick={() => onSelect(option.id)}
            >
              <span className="mr-2 flex-1 truncate">{option.name}</span>
              {option.id === selected && <Check className="h-4 w-4 ml-auto flex-shrink-0" />}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

