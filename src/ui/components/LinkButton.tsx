import { Button, type ButtonProps } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export type LinkButtonProps = {
    to:string;
} & ButtonProps;

export const LinkButton = ({to, children, ...props}:LinkButtonProps) => {
    const navigate = useNavigate();
    return <Button 
        onClick={()=>navigate(to)}
        {...props}>
            {children}
        </Button>
}