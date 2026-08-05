export class IndexManager<Key, Value> {

    constructor(private target:Map<Key, Value>) {
        
    }

    getIndex(key:Key) {
        return Array.from(this.target.keys())
            .findIndex((k) => k === key );
    }

    getIndexValue(index:number) {
        return Array.from(this.target.values())
            .find((_, i) => i === index)
    }

    getPreviousIndex(key:Key) {
        
        const index = this.getIndex(key);
        const prevIndex = index - 1;

        if (prevIndex <= -1) {
            return this.target.size - 1;
        }

        return prevIndex;
    }

    getNextIndex(key:Key) {
        const index = this.getIndex(key);
        const nextIndex = index + 1;

        if (nextIndex >= this.target.size) {
            return 0;
        }

        return nextIndex;
    }
}