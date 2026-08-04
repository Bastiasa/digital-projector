type Listener = (...args: any[]) => void;

export default class EventEmitter {

    private events = new Map<string, Listener[]>();

    on(event: string, listener: Listener): this {

        const listeners = this.events.get(event) ?? [];

        listeners.push(listener);

        this.events.set(event, listeners);

        return this;
    }

    once(event: string, listener: Listener): this {

        const wrapper: Listener = (...args) => {

            this.off(event, wrapper);

            listener(...args);

        };

        return this.on(event, wrapper);
    }

    off(event: string, listener: Listener): this {

        const listeners = this.events.get(event);

        if (!listeners) {
            return this;
        }

        this.events.set(
            event,
            listeners.filter(l => l !== listener)
        );

        return this;
    }

    removeListener(event: string, listener: Listener): this {
        return this.off(event, listener);
    }

    removeAllListeners(event?: string): this {

        if (event) {
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }

        return this;
    }

    emit(event: string, ...args: any[]): boolean {

        const listeners = this.events.get(event);

        if (!listeners || listeners.length === 0) {
            return false;
        }

        for (const listener of [...listeners]) {
            listener(...args);
        }

        return true;
    }

    listeners(event: string): Listener[] {
        return [...(this.events.get(event) ?? [])];
    }

    listenerCount(event: string): number {
        return this.events.get(event)?.length ?? 0;
    }

    eventNames(): string[] {
        return [...this.events.keys()];
    }

}