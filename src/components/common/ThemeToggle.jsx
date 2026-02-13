import { Moon, Sun } from 'lucide-react'
import { Button } from '../ui/Button'
import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle({ className, ...props }) {
    const { toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            className={`rounded-full relative overflow-hidden hover:bg-primary/10 transition-colors duration-200 ${className}`}
            onClick={toggleTheme}
            {...props}
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-foreground" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-foreground" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
