import { XCircleIcon } from "lucide-react";

export default function ErrorFormInfo({ message }: { message: string }) {

  return (
    <div className="flex items-center gap-2">
      <XCircleIcon className="text-red-500 text-sm" />
      <p className="text-red-500 text-sm">
        {message}
      </p>
    </div>
  )
}