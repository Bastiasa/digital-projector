import { createMocks } from "../utils/createMocks.ts"

export const IndexManagerMocks = () => {
    return createMocks(
        'getIndex',
        'getIndexValue',
        'getPreviousIndex',
        'getNextIndex'
    );
}