import { vi } from "vitest";

export function createMocks<const K extends readonly string[]>(...keys: K) {
    return Object.fromEntries(
        keys.map(key => [key, vi.fn()])
    ) as {
        [P in K[number]]: ReturnType<typeof vi.fn>;
    };
}