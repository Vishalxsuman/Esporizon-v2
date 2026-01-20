import Skeleton from './Skeleton'

const SectionSkeleton = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <Skeleton width={200} height={32} className="rounded-lg" />
                <Skeleton width={100} height={32} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton height={280} className="rounded-2xl" />
                <Skeleton height={280} className="rounded-2xl" />
                <Skeleton height={280} className="rounded-2xl" />
            </div>
        </div>
    )
}

export default SectionSkeleton
