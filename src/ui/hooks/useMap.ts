import { useCallback, useState } from "react";

export function useMap<K, V>(initialValues?: Iterable<[K, V]>) {
    const [map, setMap] = useState(
        () => new Map<K, V>(initialValues)
    );

    const set = useCallback((key: K, value: V) => {
        setMap(prev => {
            const next = new Map(prev);
            next.set(key, value);
            return next;
        });
    }, []);

    const remove = useCallback((key: K) => {
        setMap(prev => {
            const next = new Map(prev);
            next.delete(key);
            return next;
        });
    }, []);

    const clear = useCallback(() => {
        setMap(new Map());
    }, []);

    const replace = useCallback((entries: Iterable<[K, V]>) => {
        setMap(new Map(entries));
    }, []);

    return {
        map,
        set,
        remove,
        clear,
        replace,
        size: map.size,
        has: map.has.bind(map),
        get: map.get.bind(map),
        entries: map.entries.bind(map),
        keys: map.keys.bind(map),
        values: map.values.bind(map)
    };
}