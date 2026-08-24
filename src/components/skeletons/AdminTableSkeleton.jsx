import { Skeleton } from "../ui/Skeleton"

export function AdminTableSkeleton({ rows = 6, cols = 5 }) {
    return (
        <tbody className="divide-y divide-white/5">
            {[...Array(rows)].map((_, r) => (
                <tr key={r} className="animate-pulse">
                    {[...Array(cols)].map((_, c) => (
                        <td key={c} className="p-4">
                            <Skeleton className={`h-4 ${c === 0 ? 'w-48' : c === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    )
}

export default AdminTableSkeleton
