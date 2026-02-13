import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/context/ThemeContext"

export default function Toaster() {
    const { theme } = useTheme()

    return (
        <Sonner
            theme={theme}
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-zinc-950 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800",
                    description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400",
                    actionButton:
                        "group-[.toast]:bg-blue-600 group-[.toast]:text-zinc-50 dark:group-[.toast]:bg-blue-500",
                    cancelButton:
                        "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-zinc-400",
                },
            }}
        />
    )
}
