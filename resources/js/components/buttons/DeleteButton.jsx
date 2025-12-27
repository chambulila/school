import { Trash } from "lucide-react";
import { Button } from "../ui/button";

export default function DeleteButton({
    className = '',
    disabled,
    children,
    type = "button",
    ...props
}) {
    return <Button type={type} disabled={disabled} {...props}  className="bg-red-700 hover:bg-red-900 cursor-pointer" >
        <Trash  />
        {/* {children || 'Delete'} */}
    </Button>
}
