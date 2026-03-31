import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            shadow: [{ shadow: ["blue-500/10", "blue-500/25"] }],
        },
    },
})

export function cn(...inputs: ClassValue[]) {
    return customTwMerge(clsx(inputs))
}
