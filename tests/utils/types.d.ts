
import type { Mock } from "vitest";

export {};

declare global {
    type MockedObj<Key extends string> = {
        [T in Key]: Mock
    };
}