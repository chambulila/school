import { PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function AddButton({
    disabled,
    children,
    type="button",
    ...props
}) {
    return <Button size="sm" type={type} {...props} ><PlusCircleIcon className=" h-4 w-4" /> {children}</Button>
}
