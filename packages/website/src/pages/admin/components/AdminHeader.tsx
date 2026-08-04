import { Paper } from "@mantine/core";
import { type ReactNode } from "react";

export const AdminHeader = ({ children, }: { children: ReactNode, }) => {

    return (
        <Paper className="sticky! px-4 z-300 top-0 w-full border-b border-b-blue-600 py-[16px]">
            {children}
        </Paper>
    );
}