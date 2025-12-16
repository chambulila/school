import { Button } from "../ui/button";

export default function SecondaryButton({
    type = 'button',
    disabled,
    children,
    ...props
}) {
    return <Button variant="outline" size="sm" type={type} {...props} >{children}</Button>
}
