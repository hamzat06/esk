"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState, useMemo } from "react";
import { useDebounce } from "use-debounce";

interface iProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent) => void;
  wrapperClassName?: string;
  inputClassName?: string;
  products?: { title: string }[];
}

const SearchField = (props: iProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialValue = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialValue);
  const [debouncedValue] = useDebounce(value, 400);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update query param
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) params.set("q", debouncedValue);
    else params.delete("q");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedValue]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    setShowSuggestions(true);
  }

  // Filter products for suggestions
  const suggestions = useMemo(() => {
    if (!props.products || !value) return [];
    const query = value.toLowerCase();
    return props.products
      .filter((p) => p.title.toLowerCase().includes(query))
      .slice(0, 5); // Limit to 5 suggestions
  }, [value, props.products]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (i) => (i - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      setValue(suggestions[highlightIndex].title);
      setShowSuggestions(false);
      setHighlightIndex(0);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(title: string) {
    setValue(title);
    setShowSuggestions(false);
    setHighlightIndex(0);
  }

  return (
    <div className="relative">
      <InputGroup className={props.wrapperClassName}>
        <InputGroupInput
          placeholder={props.placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className={props.inputClassName}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 sm:size-5 text-gray-500" />
        </InputGroupAddon>
      </InputGroup>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute w-full bg-white border border-gray-200 mt-2 rounded-xl z-50 overflow-hidden shadow-lg">
          {suggestions.map((s, idx) => (
            <li
              key={s.title}
              className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-2 ${
                idx === highlightIndex
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-gray-50"
              }`}
              onMouseEnter={() => setHighlightIndex(idx)}
              onMouseDown={() => handleSuggestionClick(s.title)}
            >
              <SearchIcon className="size-4 text-gray-400" />
              <span className="text-sm sm:text-base">{s.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchField;