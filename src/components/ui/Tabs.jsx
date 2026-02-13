import * as React from "react"
import { createContext, useContext, useState } from "react"

const TabsContext = createContext({})

const Tabs = ({ defaultValue, className, children, onValueChange }) => {
    const [activeTab, setActiveTab] = useState(defaultValue)

    const handleTabChange = (value) => {
        setActiveTab(value)
        if (onValueChange) onValueChange(value)
    }

    return (
        <TabsContext.Provider value={{ activeTab, handleTabChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

const TabsList = ({ className, children }) => (
    <div className={`flex items-center ${className}`}>{children}</div>
)

const TabsTrigger = ({ value, className, children }) => {
    const { activeTab, handleTabChange } = useContext(TabsContext)
    const isActive = activeTab === value

    return (
        <button
            onClick={() => handleTabChange(value)}
            data-state={isActive ? "active" : "inactive"}
            className={className}
        >
            {children}
        </button>
    )
}

const TabsContent = ({ value, children, className }) => {
    const { activeTab } = useContext(TabsContext)
    if (activeTab !== value) return null
    return <div className={className}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
