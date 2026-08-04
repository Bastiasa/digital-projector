import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AppContextMap = {
    rcHostingUrl: string;
};

const AppContext = createContext<AppContextMap|undefined>(undefined);

export function AppProvider({children}: {children:ReactNode}) {

    const [rcHostingUrl, setRcHostingUrl] = useState('');

    const context = {
        rcHostingUrl
    }

    useEffect(()=>{
        const disconnectStarted = window.events.subscribe('rc-server-started', (url) => setRcHostingUrl(url));
        const disconnectStopped = window.events.subscribe('rc-server-stopped', ()=>setRcHostingUrl(''));

        window.app.getServerState()
            .then(serverState => {
                setRcHostingUrl(serverState.url ?? '');
            })

        return () => {
            disconnectStarted();
            disconnectStopped();
        }
    }, []);

    return <AppContext.Provider value={context}>
        {children}
    </AppContext.Provider>
}

export function useAppContext() {
    return useContext(AppContext) as AppContextMap;
}