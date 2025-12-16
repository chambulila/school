import { Save } from "lucide-react";
import { Button } from "../ui/button";

export default function SaveButton({
    disabled,
    children,
    type="button",
    ...props
}) {
    return <Button size="sm" type={type} {...props} ><Save className=" h-4 w-4" /> {children}</Button>
}
