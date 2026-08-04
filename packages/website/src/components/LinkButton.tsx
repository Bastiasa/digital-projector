import { Button, type ButtonProps } from "@mantine/core"
import { useNavigate } from "react-router-dom";

export type LinkButtonProps = {
    to: string;
} & ButtonProps;

export const LinkButtton = ({ to, ...props }: LinkButtonProps) => {

    const navigate = useNavigate();

    return (
        <Button
            {...props}
            onClick={() => navigate(to)} />
    )
}