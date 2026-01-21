import { Skeleton } from '@/components/ui/skeleton';

export function ProjectCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
            </div>
        </div>
    );
}

export function ProjectListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function MeetingChatSkeleton() {
    return (
        <div className="flex flex-col flex-1 p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DocumentListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-10 w-10" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
    );
}
