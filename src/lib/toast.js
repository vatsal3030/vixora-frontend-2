import { toast as sonnerToast } from 'sonner'

/**
 * Toast helper functions using Sonner
 */

export const toast = {
    success: (message, options = {}) => {
        return sonnerToast.success(message, {
            duration: 4000,
            ...options,
        })
    },

    error: (message, options = {}) => {
        return sonnerToast.error(message, {
            duration: 5000,
            ...options,
        })
    },

    info: (message, options = {}) => {
        return sonnerToast.info(message, {
            duration: 4000,
            ...options,
        })
    },

    warning: (message, options = {}) => {
        return sonnerToast.warning(message, {
            duration: 4500,
            ...options,
        })
    },

    loading: (message, options = {}) => {
        return sonnerToast.loading(message, options)
    },

    promise: (promise, options = {}) => {
        return sonnerToast.promise(promise, {
            loading: options.loading || 'Loading...',
            success: options.success || 'Success!',
            error: options.error || 'Something went wrong',
            ...options,
        })
    },

    dismiss: (toastId) => {
        return sonnerToast.dismiss(toastId)
    },
}

export default toast
