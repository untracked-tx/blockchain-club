import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-lg prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-white">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 className="text-4xl font-bold text-gray-900 mb-6">{children}</h1>,
          h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
          h3: ({children}) => <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>,
          p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
          li: ({children}) => <li className="text-gray-700">{children}</li>,
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-lg my-6 italic">
              {children}
            </blockquote>
          ),
          code: ({children}) => (
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>
          ),
          pre: ({children}) => (
            <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-6">{children}</pre>
          ),
          a: ({href, children}) => (
            <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
