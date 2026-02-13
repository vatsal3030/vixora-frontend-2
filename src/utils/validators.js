/**
 * Validation functions for forms
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export function validateEmail(email) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, strength: 'weak'|'medium'|'strong', errors: string[] }
 */
export function validatePassword(password) {
    const errors = []
    let strength = 'weak'

    if (!password) {
        return { isValid: false, strength: 'weak', errors: ['Password is required'] }
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    if (!/[@$!%*?&]/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)')
    }

    const isValid = errors.length === 0

    // Calculate strength
    if (isValid) {
        if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[@$!%*?&]/.test(password)) {
            strength = 'strong'
        } else if (password.length >= 8) {
            strength = 'medium'
        }
    }

    return { isValid, strength, errors }
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function validateUsername(username) {
    if (!username) {
        return { isValid: false, error: 'Username is required' }
    }

    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' }
    }

    if (username.length > 30) {
        return { isValid: false, error: 'Username must be at most 30 characters long' }
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' }
    }

    return { isValid: true, error: null }
}

/**
 * Validate full name
 * @param {string} fullName - Full name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function validateFullName(fullName) {
    if (!fullName) {
        return { isValid: false, error: 'Full name is required' }
    }

    if (fullName.length < 3) {
        return { isValid: false, error: 'Full name must be at least 3 characters long' }
    }

    if (fullName.length > 50) {
        return { isValid: false, error: 'Full name must be at most 50 characters long' }
    }

    return { isValid: true, error: null }
}
