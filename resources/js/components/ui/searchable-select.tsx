"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SelectOption {
  label: string
  value: string
}

interface SelectGroup {
  heading: string
  options: SelectOption[]
}

interface SearchableSelectProps {
  /** Flat list of options, or grouped options */
  options?: SelectOption[]
  groups?: SelectGroup[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  options,
  groups,
  placeholder = "Select an option…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  value,
  onValueChange,
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Flatten all options to find the selected label
  const allOptions: SelectOption[] = React.useMemo(() => {
    if (groups) return groups.flatMap((g) => g.options)
    return options ?? []
  }, [groups, options])

  const selectedLabel = allOptions.find((o) => o.value === value)?.label

  function handleSelect(selectedValue: string) {
    onValueChange?.(selectedValue === value ? "" : selectedValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn(!selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command
          /**
           * Custom filter: match against the item's label (stored in keywords[0])
           * rather than the value prop, since label and value are different.
           */
          filter={(itemValue, search, keywords) => {
            const label = keywords?.[0] ?? itemValue
            if (label.toLowerCase().includes(search.toLowerCase())) return 1
            return 0
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            {/* ── Grouped options ── */}
            {groups
              ? groups.map((group) => (
                <CommandGroup key={group.heading} heading={group.heading}>
                  {group.options.map((option) => (
                    <SelectItem
                      key={option.value}
                      option={option}
                      isSelected={value === option.value}
                      onSelect={handleSelect}
                    />
                  ))}
                </CommandGroup>
              ))
              : null}

            {/* ── Flat options (no groups) ── */}
            {options && !groups ? (
              <CommandGroup>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    option={option}
                    isSelected={value === option.value}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Internal item ────────────────────────────────────────────────────────────

interface SelectItemProps {
  option: SelectOption
  isSelected: boolean
  onSelect: (value: string) => void
}

function SelectItem({ option, isSelected, onSelect }: SelectItemProps) {
  return (
    <CommandItem
      /**
       * `value` is used as the unique key inside cmdk's internal state.
       * `keywords` is what the filter function receives — we pass the label
       * here so searching by human-readable text works correctly even when
       * the value is an opaque ID or code.
       */
      value={option.value}
      keywords={[option.label]}
      onSelect={onSelect}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      {option.label}
    </CommandItem>
  )
}