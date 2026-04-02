type Props = {
  message?: string
  action?: React.ReactNode
}

export default function ErrorState({
  message = "Something went wrong. Please try again.",
  action
}: Props) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-6">

      <div className="text-4xl mb-4">⚠️</div>

      <p className="text-red-600 font-medium">
        {message}
      </p>

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}

    </div>
  )
}