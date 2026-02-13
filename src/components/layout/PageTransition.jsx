import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export const PageTransition = ({ children }) => {
    const location = useLocation()

    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.3
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    )
}
