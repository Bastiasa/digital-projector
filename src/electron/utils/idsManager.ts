export class IdsManager<T = string> {


    private ids = new Map<string, T>();


    constructor(initialData: [string, T][] = []) {
        this.ids = new Map(initialData);
    }


    pushId(key: string, value: T) {
        this.ids.set(key, value);
    }


    getIds() {
        return Array.from(this.ids.entries());
    }

    getValues() {
        return Array.from(this.ids.values());
    }

    removeId(key: string) {
        this.ids.delete(key);
    }

}