import { Pencil } from "lucide-react";

export default function EditButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return <Pencil disabled={disabled} {...props} className="text-gray-800 h-4 w-4" />
}
