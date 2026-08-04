import { useEffect } from "react";

export default function PageTitle({children}: {children:string|string[]}) {
    
    useEffect(()=>{
        if (children instanceof Array) {
            document.title = children.join("");
        } else if (typeof children == "string") {
            document.title = children;
        }
    }, [children])

    return (<></>);
}