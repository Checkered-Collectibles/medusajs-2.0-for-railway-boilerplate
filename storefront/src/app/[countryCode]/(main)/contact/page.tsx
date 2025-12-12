export default function Contact() {
    return (
        <main className="flex max-w-7xl mx-auto min-h-screen items-center justify-center px-2">
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-semibold mb-4">Contact Support</h1>

                <p className="text-gray-600 mb-2">
                    Need help or have a question?
                </p>

                <p className="text-gray-800">
                    Email us at{" "}
                    <a
                        href="mailto:hello@checkered.in"
                        className="text-blue-600 hover:underline"
                    >
                        hello@checkered.in
                    </a>
                </p>
            </div>
        </main>
    )
}