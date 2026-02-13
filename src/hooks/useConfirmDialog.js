import { useState } from 'react'

export function useConfirmDialog() {
    const [dialogProps, setDialogProps] = useState(null)

    const showConfirm = (props) => {
        return new Promise((resolve) => {
            setDialogProps({
                ...props,
                onConfirm: async () => {
                    await props.onConfirm?.()
                    setDialogProps(null)
                    resolve(true)
                },
                onCancel: () => {
                    props.onCancel?.()
                    setDialogProps(null)
                    resolve(false)
                }
            })
        })
    }

    return { showConfirm, dialogProps }
}
