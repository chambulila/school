import { Trash } from "lucide-react";

export default function DeleteButton({
    className = '',
    disabled,
    children,
    type = "button",
    ...props
}) {
    return <Trash type={type} disabled={disabled} {...props} className="text-red-800 h-4 w-4 cursor-pointer" />
}
