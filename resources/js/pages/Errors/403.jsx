import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import PrimaryButton from '@/components/buttons/PrimaryButton';

export default function Forbidden({ status = 403, message }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
            <Head title="403 Forbidden" />

            <div className="text-center space-y-6 max-w-md px-4">
                <h1 className="text-9xl font-bold text-gray-200">{status}</h1>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Access Denied
                    </h2>
                    <p className="text-gray-600">
                        {message || "Sorry, you don't have permission to access this page."}
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
