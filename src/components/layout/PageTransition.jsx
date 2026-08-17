import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export const PageTransition = ({ children }) => {
    const location = useLocation()

    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1], /* matches --ease-out */
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    )
}
