import type { ReactNode } from "react"

export type CenteredFullSizeContainerProps = {
    children?: ReactNode;
}

export function CenteredFullSizeContainer(
    {children} : CenteredFullSizeContainerProps
) {
    return (
        <div className="flex w-dvw max-w-125 px-12  mx-auto h-dvh items-center justify-center">
            {children}
        </div>
    );
}