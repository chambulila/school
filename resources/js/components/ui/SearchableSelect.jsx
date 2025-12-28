import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"

export default function SearchableSelect({
    value,
    onChange,
    options = [],
    placeholder = "Select option",
    searchPlaceholder = "Search...",
    getLabel,
    getValue,
    disabled = false,
    className,
}) {
    const [open, setOpen] = React.useState(false)
    const selectedOption = options.find(
        (option) => String(getValue(option)) == String(value)
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedOption ? getLabel(selectedOption) : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup>
                        {options.map((option) => {
                            const optionValue = String(getValue(option))
                            return (
                                <CommandItem
                                    key={optionValue}
                                    value={String(getLabel(option))}
                                    onSelect={() => {
                                        onChange(optionValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            optionValue === String(value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {getLabel(option)}
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
