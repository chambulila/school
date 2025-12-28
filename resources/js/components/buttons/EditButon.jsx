import { Pencil } from "lucide-react";
import { Button } from "../ui/button";

export default function EditButton({
    className = '',
    disabled = false,
    children,
    size = 'sm',
    type = "button",
    ...props
}) {
    return <Button size={size} type={type} disabled={disabled} {...props}  className=" cursor-pointer" >
        <Pencil  />
        {/* {children || 'Edit'} */}
    </Button>

}
