import { Pencil } from "lucide-react";
import { Button } from "../ui/button";

export default function EditButton({
    className = '',
    disabled,
    children,
    type = "button",
    ...props
}) {
    return <Button type={type} disabled={disabled} {...props}  className=" cursor-pointer" >
        <Pencil  />
        {/* {children || 'Edit'} */}
    </Button>

}
