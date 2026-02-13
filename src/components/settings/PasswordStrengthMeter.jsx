import { useMemo } from 'react'
import { cn } from '../../lib/utils'
import { Check, X } from 'lucide-react'

/**
 * Calculate password strength (0-4)
 */
function calculateStrength(password) {
    let strength = 0

    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    // Normalize to 0-4 scale
    return Math.min(4, Math.floor(strength * 0.7))
}

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-500'
]

/**
 * Password strength meter with visual indicator and requirements checklist
 */
export function PasswordStrengthMeter({ password, showRequirements = true, className }) {
    const strength = useMemo(() => calculateStrength(password), [password])

    const requirements = useMemo(() => [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { label: 'Contains number', met: /[0-9]/.test(password) },
        { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
    ], [password])

    if (!password) return null

    return (
        <div className={cn("space-y-3", className)}>
            {/* Strength Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span className={cn(
                        "font-medium",
                        strength <= 1 ? "text-red-500" :
                            strength === 2 ? "text-yellow-500" :
                                "text-green-500"
                    )}>
                        {strengthLabels[strength]}
                    </span>
                </div>
                <div className="flex gap-1">
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-300",
                                index <= strength ? strengthColors[strength] : "bg-secondary"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Requirements Checklist */}
            {showRequirements && (
                <div className="space-y-1.5">
                    {requirements.map((req, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-2 text-sm transition-colors duration-200",
                                req.met ? "text-green-500" : "text-muted-foreground"
                            )}
                        >
                            {req.met ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <X className="w-4 h-4 opacity-50" />
                            )}
                            <span>{req.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PasswordStrengthMeter
