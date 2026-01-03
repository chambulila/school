import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/components/buttons/PrimaryButton';

export default function NotFound({ status = 404, message }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
            <Head title="404 Not Found" />

            <div className="text-center space-y-6 max-w-md px-4">
                <h1 className="text-9xl font-bold text-gray-200">{status}</h1>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600">
                        {message || "Sorry, the resource you are looking for could not be found."}
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
