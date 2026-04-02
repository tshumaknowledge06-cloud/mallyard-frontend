type Props = {
  title: string
  message: string
  action?: React.ReactNode
}

export default function EmptyState({ title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      
      <div className="text-5xl mb-4">📭</div>

      <h2 className="text-xl font-semibold text-gray-800">
        {title}
      </h2>

      <p className="text-gray-500 mt-2 max-w-md">
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