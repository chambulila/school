import { Pencil } from "lucide-react";

export default function EditButton({
    className = '',
    disabled,
    children,
    type = "button",
    ...props
}) {
    return <Pencil type={type} disabled={disabled} {...props} className="text-gray-800 h-4 w-4 cursor-pointer" />
}
