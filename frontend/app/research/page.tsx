"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Search,
	BookOpen,
	Calendar,
	Clock,
	User,
	TrendingUp,
	Star,
	ChevronRight,
	Tag
} from "lucide-react"
import { researchArticles, categories } from "@/lib/articles-data"

export default function ResearchPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [showSecrets, setShowSecrets] = useState(false)
	const [secretSequence, setSecretSequence] = useState<string[]>([])
	const router = useRouter()

	// Secret sequence to reveal passwords (simple and memorable)
	const TARGET_SEQUENCE = ["trending", "trending", "newsletter"] // Click trending twice then newsletter button
	
	const handleSecretClick = (elementId: string) => {
		console.log('Secret click:', elementId, 'Current sequence:', secretSequence) // Debug log
		
		setSecretSequence(prev => {
			const newSequence = [...prev, elementId]
			console.log('New sequence:', newSequence) // Debug log
			
			// Check if the sequence matches our target
			const isCorrectSequence = TARGET_SEQUENCE.every((target, index) => 
				newSequence[index] === target
			)
			
			if (newSequence.length === TARGET_SEQUENCE.length) {
				if (isCorrectSequence) {
					console.log('Secret sequence completed!') // Debug log
					setShowSecrets(true)
				} else {
					console.log('Wrong sequence, resetting') // Debug log
				}
				// Reset sequence after clicks regardless
				return []
			}
			
			// Reset if wrong element clicked
			if (newSequence[newSequence.length - 1] !== TARGET_SEQUENCE[newSequence.length - 1]) {
				console.log('Wrong element clicked, resetting sequence') // Debug log
				return []
			}
			
			return newSequence
		})
	}

	// Handle search functionality with secret keywords
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		
		// Check for Members Lounge secret keyword
		if (searchQuery.toLowerCase().trim() === "satoshi") {
			router.push("/memberslounge?key=authorized")
			return
		}

		// Check for O Club secret keyword
		if (searchQuery.toLowerCase().trim() === "capt_satoshi") {
			router.push("/oclub?key=MesshallMischief")
			return
		}
		// Normal search functionality is handled by the filter below
	}

	// Filter articles based on search query and category only
	const filteredArticles = researchArticles
		.filter((article) => {
			const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			                     article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
			                     article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
			                     article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
			
			const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
			
			return matchesSearch && matchesCategory
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first

	const featuredArticles = researchArticles.filter(article => 
		article.id === "humanitarian-blockchain-initiative" || 
		article.id === "bitcoin-temporal-cycles"
	)

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-20 md:py-28">
				{/* Background Effects */}
				<div className="absolute inset-0 opacity-20">
					<div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
					<div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
					<div className="absolute bottom-20 left-40 w-36 h-36 bg-white/20 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
				</div>
				
				<div className="container relative mx-auto px-4 text-center">
					<div className="mx-auto max-w-4xl">
						<div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur-sm border border-white/30">
							<BookOpen className="mr-2 h-4 w-4" />
							Research & Analysis
						</div>
						
						<h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
							📚 Research Hub
						</h1>
						
						<p className="mb-8 text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
							Cutting-edge research, analysis, and insights into blockchain technology, cryptocurrency markets, and the future of decentralized finance.
						</p>

						{/* Simple Search Bar */}
						<div className="max-w-2xl mx-auto">
							<form onSubmit={handleSearch} className="relative">
								<div className="relative">
									<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
									<Input
										type="text"
										placeholder="Search articles, authors, topics..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full pl-12 pr-4 py-3 text-lg bg-white/95 backdrop-blur-sm border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent"
									/>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>

			<div className="container mx-auto px-4 py-12">
				{/* Featured Articles Section */}
				{featuredArticles.length > 0 && (
					<section className="mb-12">
						<div className="flex items-center gap-3 mb-6">
							<Star 
								className="h-6 w-6 text-yellow-500 cursor-pointer hover:scale-110 transition-transform" 
								onClick={() => handleSecretClick("star")}
							/>
							<h2 className="text-2xl font-bold text-gray-900">Featured Research</h2>
						</div>
						
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{featuredArticles.slice(0, 3).map((article) => (
								<Card 
									key={article.id} 
									className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white/90"
									onClick={() => router.push(`/research/${article.id}`)}
								>
									<CardHeader className="pb-4">
										<div className="flex items-center justify-between mb-2">
											<Badge variant="secondary" className="bg-blue-100 text-blue-700">
												{article.category}
											</Badge>
											<Star className="h-4 w-4 text-yellow-500 fill-current" />
										</div>
										<CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
											{article.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-gray-600 mb-4 line-clamp-3">
											{article.excerpt}
										</CardDescription>
										
										<div className="flex items-center justify-between text-sm text-gray-500">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4" />
												<span>{article.author}</span>
											</div>
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4" />
												<span>{article.readTime}</span>
											</div>
										</div>
										
										<div className="flex items-center justify-between mt-3">
											<div className="flex items-center gap-2 text-xs text-gray-500">
												<Calendar className="h-3 w-3" />
												<span>{new Date(article.date).toLocaleDateString()}</span>
											</div>
											<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>
				)}

				{/* Simple Category Filter */}
				<div className="flex justify-center mb-8">
					<Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
						<TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200">
							{categories.map((category) => (
								<TabsTrigger 
									key={category} 
									value={category}
									className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
								>
									{category}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>

				{/* Articles Grid */}
				<section>
					{filteredArticles.length === 0 ? (
						<div className="text-center py-12">
							<BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
							<p className="text-gray-600">Try adjusting your search terms or category filter.</p>
						</div>
					) : (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{filteredArticles.map((article) => (
								<Card 
									key={article.id} 
									className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white/90"
									onClick={() => router.push(`/research/${article.id}`)}
								>
									<CardHeader className="pb-4">
										<div className="flex items-center justify-between mb-2">
											<Badge variant="secondary" className="bg-gray-100 text-gray-700">
												{article.category}
											</Badge>
											{article.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
										</div>
										<CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
											{article.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-gray-600 mb-4 line-clamp-3">
											{article.excerpt}
										</CardDescription>
										
										<div className="flex flex-wrap gap-1 mb-4">
											{article.tags.slice(0, 3).map((tag) => (
												<Badge key={tag} variant="outline" className="text-xs">
													<Tag className="h-3 w-3 mr-1" />
													{tag}
												</Badge>
											))}
										</div>
										
										<div className="flex items-center justify-between text-sm text-gray-500">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4" />
												<span>{article.author}</span>
											</div>
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4" />
												<span>{article.readTime}</span>
											</div>
										</div>
										
										<div className="flex items-center justify-between mt-3">
											<div className="flex items-center gap-2 text-xs text-gray-500">
												<Calendar className="h-3 w-3" />
												<span>{new Date(article.date).toLocaleDateString()}</span>
											</div>
											<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</section>
			</div>

			{/* Static Call to Action Footer */}
			<section className="mt-16 text-center">
				<Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
					<CardContent className="p-8">
						<TrendingUp 
							className="h-12 w-12 mx-auto mb-4 opacity-90 cursor-pointer hover:scale-110 transition-transform" 
							onClick={() => handleSecretClick("trending")}
						/>
						<h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
						<p className="text-blue-100 mb-6 max-w-2xl mx-auto">
							Get the latest research insights, market analysis, and blockchain developments delivered to your inbox.
						</p>
						
						{!showSecrets ? (
							<div className="space-y-4">
								<Button 
									variant="secondary" 
									size="lg" 
									className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
									onClick={() => handleSecretClick("newsletter")}
								>
									Subscribe to Newsletter
								</Button>
								
								{/* Secret sequence progress indicator (only show if user has started) */}
								{secretSequence.length > 0 && (
									<div className="text-xs text-blue-200 opacity-75">
										Secret progress: {secretSequence.length}/3 
										{secretSequence.length === 2 && " (One more click! 📧)"}
									</div>
								)}
							</div>
						) : (
							<div className="bg-black/20 rounded-lg p-4 text-left max-w-md mx-auto">
								<p className="font-medium mb-3 text-center">🔐 Secret Access Codes:</p>
								<div className="space-y-2">
									<div>
										<span className="text-blue-200">Members Lounge:</span>
										<code className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">satoshi</code>
									</div>
									<div>
										<span className="text-blue-200">O Club:</span>
										<code className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">capt_satoshi</code>
									</div>
								</div>
								<p className="text-xs mt-3 text-blue-200 text-center">
									✨ Enter these in the search bar above! ✨
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	)
}
