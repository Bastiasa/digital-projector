import { useState } from "react"

export const useObject = <obj extends Record<string, any>>(initialValue: obj) => {

    const [object, setObject] = useState<obj>(initialValue);

    const set = (data: Partial<obj>) => {
        setObject(prev => ({ ...prev, ...data }));
    };

    return {
        value: object,
        set
    };
}