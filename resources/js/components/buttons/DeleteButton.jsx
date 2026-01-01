import { Trash } from "lucide-react";
import { Button } from "../ui/button";

export default function DeleteButton({
    className = '',
    disabled,
    children,
    size = 'sm',
    type = "button",
    ...props
}) {
    return <Button size={size} type={type} disabled={disabled} {...props}  className="bg-red-700 hover:bg-red-900 cursor-pointer" >
        <Trash  />
        {/* {children || 'Delete'} */}
    </Button>
}
