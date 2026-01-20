import React from 'react'

interface EmptyStateProps {
    title: string
    description?: string
    actionLabel?: string
    onAction?: () => void
    icon?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    actionLabel,
    onAction,
    icon
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white/5 border border-white/10">
            {icon && <div className="mb-4 text-gray-400">{icon}</div>}
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            {description && <p className="text-gray-400 mb-6 max-w-sm">{description}</p>}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00E0C6] to-[#7B61FF] text-black font-bold hover:shadow-lg hover:shadow-[#00E0C6]/20 transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

export default EmptyState
