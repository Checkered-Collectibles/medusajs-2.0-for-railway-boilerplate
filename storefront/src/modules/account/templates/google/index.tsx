import { Button } from "@medusajs/ui"
import { loginWithGoogleAction } from "./action"

export default function LoginGoogle() {
    return (
        <form action={loginWithGoogleAction}>
            <Button
                size="large"
                className="w-full mt-6"
                type="submit"
                variant="secondary"
            >
                Login with Google
            </Button>
        </form>
    )
}