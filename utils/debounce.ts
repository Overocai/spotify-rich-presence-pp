/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Returns a debounced version of fn that delays invocation by wait ms.
 * The returned function has a .cancel() method to clear a pending call.
 */
export function debounce<T extends unknown[]>(
    fn: (...args: T) => void,
    wait: number,
): ((...args: T) => void) & { cancel(): void; } {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: T) => {
        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            fn(...args);
        }, wait);
    };

    debounced.cancel = () => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    };

    return debounced;
}
