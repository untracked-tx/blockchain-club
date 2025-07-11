"use client"

import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  Bookmark, 
  Download, 
  BookOpen, 
  Star, 
  Tag,
  ChevronRight,
  Eye,
  ThumbsUp,
  MessageCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { researchArticles, readMarkdownFile } from "@/lib/articles-data"
import { MarkdownContent } from "@/components/markdown-content"

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')

  // Find the article by ID
  const article = researchArticles.find(a => a.id === params.id)

  useEffect(() => {
    if (article?.isMarkdown && article?.filePath) {
      readMarkdownFile(article.filePath).then(content => {
        setMarkdownContent(content)
      })
    }
  }, [article])

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or may have been moved.</p>
          <Button onClick={() => router.push("/research")} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Research
          </Button>
        </div>
      </div>
    )
  }

  // Find related articles by category
  const relatedArticles = researchArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3)

  const handleShare = () => {
    setShareDropdownOpen(!shareDropdownOpen)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setShareDropdownOpen(false)
    // You could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/research")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Research
            </Button>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="relative"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                {shareDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={copyToClipboard}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                {isBookmarked ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm">
                {article.category}
              </Badge>
              {article.featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-sm">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Article metadata */}
            <div className="flex flex-wrap items-center gap-6 py-6 border-t border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-5 w-5" />
                <span className="font-medium">{article.author}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>{new Date(article.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>{article.readTime}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="h-5 w-5" />
                <span>1.2k views</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-4">
              <Tag className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </header>

          {/* Article Content */}
          <article className="mb-12">
            {article.isMarkdown && markdownContent ? (
              <MarkdownContent content={markdownContent} />
            ) : (
              <div 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
          </article>

          {/* Article Footer - Engagement */}
          <div className="border-t border-gray-200 pt-8 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>47</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>12 Comments</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="border-t border-gray-200 pt-12">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Related Research</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedArticles.map((relatedArticle) => (
                  <Card 
                    key={relatedArticle.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm hover:bg-white/90"
                    onClick={() => router.push(`/research/${relatedArticle.id}`)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                          {relatedArticle.category}
                        </Badge>
                        {relatedArticle.featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {relatedArticle.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 mb-4 line-clamp-2">
                        {relatedArticle.excerpt}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{relatedArticle.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{relatedArticle.readTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(relatedArticle.date).toLocaleDateString()}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/research")}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
                >
                  View All Research Articles
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
