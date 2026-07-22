import { XCircleIcon } from 'lucide-react';

export default function ErrorFormInfo({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2">
            <XCircleIcon className="text-sm text-red-500" />
            <p className="text-sm text-red-500">{message}</p>
        </div>
    );
}
