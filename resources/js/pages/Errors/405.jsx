import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/components/buttons/PrimaryButton';

export default function MethodNotAllowed({ status = 405, message }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
            <Head title="405 Method Not Allowed" />

            <div className="text-center space-y-6 max-w-md px-4">
                <h1 className="text-9xl font-bold text-gray-200">{status}</h1>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Method Not Allowed
                    </h2>
                    <p className="text-gray-600">
                        {message || "Sorry, the method you are using is not allowed for this resource."}
                    </p>
                </div>

                <div className="flex justify-center">
                    <Link href="/dashboard">
                        <PrimaryButton>
                            Return to Dashboard
                        </PrimaryButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
