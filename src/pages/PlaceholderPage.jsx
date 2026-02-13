export default function PlaceholderPage({ title }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <h1 className="text-3xl font-display font-bold text-gradient">{title}</h1>
            <p className="text-gray-400">This feature is coming soon in Day 3-4 development.</p>
        </div>
    )
}
