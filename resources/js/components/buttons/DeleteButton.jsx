import { Trash } from "lucide-react";

export default function DeleteButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return <Trash disabled={disabled} {...props} className="text-red-800 h-4 w-4" />
}
