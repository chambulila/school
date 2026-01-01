import { Button } from "../ui/button";
import { usePage } from "@inertiajs/react";

export default function PrimaryButton({
    disabled,
    children,
    type="button",
    ...props
}) {
    const { props: pageProps } = usePage();

    return <Button style={{ backgroundColor: pageProps?.settings?.theme_color || "#007bff", color: "#fff" }} size="sm" type={type} {...props} > {children}</Button>
}
