import { Download, Trash } from "lucide-react";
import { Button } from "../ui/button";

export default function DownloadButton({
    className = '',
    disabled,
    children,
    size = 'sm',
    type = "button",
    ...props
}) {
    return <Button size={size} type={type} disabled={disabled} {...props}  className="bg-yellow-600 hover:bg-yellow-900 cursor-pointer" >
        <Download />
        {/* {children || 'Download'} */}
    </Button>
}
