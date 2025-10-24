"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  const components: Components = {
    // Headings
    h1: ({ node, ...props }) => (
      <h1 className="text-white text-2xl font-bold mb-4 mt-6" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-white text-xl font-bold mb-3 mt-5" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-white text-lg font-bold mb-2 mt-4" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-white text-base font-bold mb-2 mt-3" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-white text-sm font-bold mb-2 mt-3" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-white text-xs font-bold mb-2 mt-3" {...props} />
    ),

    // Paragraphs
    p: ({ node, ...props }) => (
      <p className="text-gray-200 mb-3 leading-relaxed" {...props} />
    ),

    // Lists
    ul: ({ node, ...props }) => (
      <ul className="text-gray-200 mb-3 space-y-1 list-disc list-inside" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="text-gray-200 mb-3 space-y-1 list-decimal list-inside" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-gray-200 ml-4" {...props} />
    ),

    // Code blocks
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      
      // Inline code (no language class)
      if (!match) {
        return (
          <code
            className="bg-gray-800 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        )
      }
      
      // Block code (has language class)
      return (
        <code
          className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-700"
          {...props}
        >
          {children}
        </code>
      )
    },
    pre: ({ node, ...props }) => (
      <pre className="mb-3 rounded-lg overflow-x-auto" {...props} />
    ),

    // Blockquotes
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-purple-500 bg-purple-900/10 pl-4 py-2 mb-3 text-gray-200 italic"
        {...props}
      />
    ),

    // Links
    a: ({ node, ...props }) => (
      <a
        className="text-blue-400 hover:text-blue-300 underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),

    // Tables
    table: ({ node, ...props }) => (
      <div className="mb-3 overflow-x-auto">
        <table className="min-w-full border border-gray-700 rounded-lg" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-gray-800" {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="bg-gray-900/50" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="border-b border-gray-700" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="px-4 py-2 text-left text-white font-semibold" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-4 py-2 text-gray-200" {...props} />
    ),

    // Strong/Bold
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-white" {...props} />
    ),

    // Emphasis/Italic
    em: ({ node, ...props }) => (
      <em className="italic text-gray-200" {...props} />
    ),

    // Horizontal rule
    hr: ({ node, ...props }) => (
      <hr className="border-gray-700 my-4" {...props} />
    ),

    // Images
    img: ({ node, ...props }) => (
      <img className="max-w-full h-auto rounded-lg my-3" {...props} />
    ),
  }

  return (
    <div className={`prose prose-invert max-w-none text-sm md:text-base ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
