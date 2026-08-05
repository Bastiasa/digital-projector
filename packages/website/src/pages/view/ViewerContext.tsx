import { createContext, useContext, type ReactNode } from "react";
import { useViewerSocket } from "./hooks/useViewerSocket";


type ViewerContextProps = ReturnType<typeof useViewerSocket>;

const ViewerContext = createContext<ViewerContextProps | undefined>(undefined);

export function ViewerProvider({children}:{children:ReactNode}) {

    const viewerSocket = useViewerSocket();
    
    return <ViewerContext.Provider value={{
        ...viewerSocket
    }}>
        {children}
    </ViewerContext.Provider>
}

export function useViewerContext() {
    const context = useContext(ViewerContext);

    if (!context) {
        throw new Error("ViewerContext is null. You must declare ViewerProvider.");
    }

    return context as ViewerContextProps;
}
