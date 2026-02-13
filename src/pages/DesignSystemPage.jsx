import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Button,
    Input,
    Avatar,
    Badge,
    Skeleton,
    VideoCardSkeleton,
    Card,
    CardHeader,
    CardContent,
    CardFooter
} from '../components/ui'
import {
    Play,
    Heart,
    Share2,
    Upload,
    Search,
    TrendingUp,
    Sparkles
} from 'lucide-react'

export default function DesignSystemPage() {
    const [inputValue, setInputValue] = useState('')
    const [inputError, setInputError] = useState('')

    const handleInputChange = (e) => {
        setInputValue(e.target.value)
        if (e.target.value.length < 3 && e.target.value.length > 0) {
            setInputError('Input must be at least 3 characters')
        } else {
            setInputError('')
        }
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center py-12"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-primary-500" />
                    <h1 className="text-5xl font-display font-bold text-gradient">
                        Vixora Design System
                    </h1>
                </div>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    A production-grade design system built with Tailwind CSS, Framer Motion, and React
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Badge variant="primary">v1.0.0</Badge>
                    <Badge variant="success">Dark Mode</Badge>
                    <Badge variant="live">LIVE</Badge>
                </div>
            </motion.section>

            {/* Color Palette */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Color Palette</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-primary-500 flex items-center justify-center text-white font-semibold shadow-glow">
                            Primary
                        </div>
                        <p className="text-sm text-gray-400">#EF4444</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-success flex items-center justify-center text-white font-semibold">
                            Success
                        </div>
                        <p className="text-sm text-gray-400">#22C55E</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-warning flex items-center justify-center text-black font-semibold">
                            Warning
                        </div>
                        <p className="text-sm text-gray-400">#EAB308</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-danger flex items-center justify-center text-white font-semibold">
                            Danger
                        </div>
                        <p className="text-sm text-gray-400">#F87171</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
                    <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-background border border-border"></div>
                        <p className="text-xs text-gray-400">Background</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-card border border-border"></div>
                        <p className="text-xs text-gray-400">Card</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-gray-900"></div>
                        <p className="text-xs text-gray-400">Gray 900</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-gray-800"></div>
                        <p className="text-xs text-gray-400">Gray 800</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-gray-700"></div>
                        <p className="text-xs text-gray-400">Gray 700</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-border"></div>
                        <p className="text-xs text-gray-400">Border</p>
                    </div>
                </div>
            </section>

            {/* Typography */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Typography</h2>
                <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Display / H1</p>
                        <h1 className="text-4xl font-display font-bold">The quick brown fox</h1>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">H2</p>
                        <h2 className="text-3xl font-display font-bold">The quick brown fox</h2>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">H3</p>
                        <h3 className="text-2xl font-display font-semibold">The quick brown fox</h3>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Body Large</p>
                        <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Body</p>
                        <p className="text-base">The quick brown fox jumps over the lazy dog</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Body Small</p>
                        <p className="text-sm text-gray-400">The quick brown fox jumps over the lazy dog</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Caption</p>
                        <p className="text-xs text-gray-500">The quick brown fox jumps over the lazy dog</p>
                    </div>
                </div>
            </section>

            {/* Buttons */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Buttons</h2>
                <div className="space-y-6">
                    {/* Variants */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-300">Variants</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="primary">
                                <Play className="w-4 h-4 mr-2" />
                                Primary Button
                            </Button>
                            <Button variant="ghost">Ghost Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="danger">
                                Danger Button
                            </Button>
                            <Button variant="success">Success Button</Button>
                            <Button disabled>Disabled Button</Button>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-300">Sizes</h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                            <Button size="icon">
                                <Heart className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* With Icons */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-300">With Icons</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="primary">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Video
                            </Button>
                            <Button variant="outline">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                            <Button variant="ghost">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Inputs */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Input Fields</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Default Input</label>
                        <Input placeholder="Enter your email..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">With Value</label>
                        <Input
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Type at least 3 characters..."
                            error={inputError}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <Input type="password" placeholder="Enter password..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Disabled</label>
                        <Input disabled placeholder="Disabled input..." />
                    </div>
                </div>
            </section>

            {/* Avatars & Badges */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Avatars & Badges</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Avatars */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">Avatar Sizes</h3>
                        <div className="flex items-end gap-4">
                            <Avatar size="xs" alt="John Doe" />
                            <Avatar size="sm" alt="Jane Smith" />
                            <Avatar size="md" alt="Mike Johnson" online />
                            <Avatar size="lg" alt="Sarah Wilson" />
                            <Avatar size="xl" alt="Tom Brown" />
                        </div>
                    </div>

                    {/* Badges */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">Badge Variants</h3>
                        <div className="flex flex-wrap gap-3">
                            <Badge>Default</Badge>
                            <Badge variant="primary">Primary</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="danger">Danger</Badge>
                            <Badge variant="warning">Warning</Badge>
                            <Badge variant="live">LIVE</Badge>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cards */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Cards</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card hoverable>
                        <CardHeader>
                            <h3 className="font-semibold text-lg">Card with Header</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400">
                                This is a card component with header, content, and hover effects.
                            </p>
                        </CardContent>
                    </Card>

                    <Card hoverable clickable onClick={() => alert('Card clicked!')}>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="w-6 h-6 text-primary-500" />
                                <h3 className="font-semibold text-lg">Clickable Card</h3>
                            </div>
                            <p className="text-gray-400">
                                Click me to see the interaction. I have hover and click effects.
                            </p>
                        </CardContent>
                    </Card>

                    <Card hoverable>
                        <CardHeader>
                            <h3 className="font-semibold text-lg">Card with Footer</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400">
                                Cards can have headers, content, and footers.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm" variant="outline" className="w-full">
                                Action Button
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            {/* Loading States */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Loading States</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">Skeleton Loaders</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full rounded-full" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">Video Card Skeleton</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <VideoCardSkeleton />
                            <VideoCardSkeleton />
                            <VideoCardSkeleton />
                        </div>
                    </div>
                </div>
            </section>

            {/* Animation Showcase */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Animations</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-card p-6 rounded-lg border border-border text-center cursor-pointer"
                    >
                        <p className="font-semibold mb-2">Hover Scale</p>
                        <p className="text-sm text-gray-400">Hover over me</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ rotate: 5 }}
                        className="bg-card p-6 rounded-lg border border-border text-center cursor-pointer"
                    >
                        <p className="font-semibold mb-2">Hover Rotate</p>
                        <p className="text-sm text-gray-400">Hover over me</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -8 }}
                        className="bg-card p-6 rounded-lg border border-border text-center cursor-pointer"
                    >
                        <p className="font-semibold mb-2">Hover Lift</p>
                        <p className="text-sm text-gray-400">Hover over me</p>
                    </motion.div>
                </div>
            </section>

            {/* Spacing System */}
            <section>
                <h2 className="text-3xl font-display font-bold mb-6">Spacing System (4px base grid)</h2>
                <div className="bg-card p-6 rounded-lg border border-border">
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 6, 8, 12, 16].map((spacing) => (
                            <div key={spacing} className="flex items-center gap-4">
                                <div
                                    className="bg-primary-500 h-4"
                                    style={{ width: `${spacing * 4}px` }}
                                />
                                <span className="text-sm text-gray-400">
                                    spacing-{spacing} = {spacing * 4}px
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Design Tokens Summary */}
            <section className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 p-8 rounded-xl border border-primary-500/20">
                <h2 className="text-3xl font-display font-bold mb-4">Design System Summary</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <div>
                        <h4 className="font-semibold text-primary-500 mb-2">Colors</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>✓ Primary (RED)</li>
                            <li>✓ Semantic (Success, Warning, Danger)</li>
                            <li>✓ Grayscale (10 shades)</li>
                            <li>✓ Dark theme optimized</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary-500 mb-2">Typography</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>✓ Inter (body)</li>
                            <li>✓ Poppins (display)</li>
                            <li>✓ 7 size levels</li>
                            <li>✓ WCAG AA compliant</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary-500 mb-2">Components</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>✓ Button (5 variants)</li>
                            <li>✓ Input + validation</li>
                            <li>✓ Card with motion</li>
                            <li>✓ Skeleton loaders</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary-500 mb-2">Animations</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>✓ Framer Motion</li>
                            <li>✓ 3 durations (150-350ms)</li>
                            <li>✓ Smooth easing</li>
                            <li>✓ Hover states</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}
