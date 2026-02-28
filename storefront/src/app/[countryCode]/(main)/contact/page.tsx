export default function Contact() {
    return (
        <main className="flex max-w-7xl mx-auto min-h-[80vh] items-center justify-center px-2">
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
                <p className="">Or</p>
                <p className="text-gray-800">
                    Message us on {" "}
                    <a
                        target="_blank"
                        href="https://wa.me/918471092205"
                        className="text-blue-600 hover:underline"
                    >
                        Whatsapp
                    </a>
                </p>

            </div>
        </main>
    )
}