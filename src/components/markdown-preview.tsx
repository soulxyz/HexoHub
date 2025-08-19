'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          className="rounded-md text-sm"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
          {children}
        </code>
      );
    },
    blockquote({ children }: any) {
      return (
        <blockquote className="border-l-4 border-border pl-4 italic my-4 text-muted-foreground">
          {children}
        </blockquote>
      );
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border border-border">
            {children}
          </table>
        </div>
      );
    },
    th({ children }: any) {
      return (
        <th className="border border-border px-4 py-2 bg-muted text-left font-semibold text-foreground">
          {children}
        </th>
      );
    },
    td({ children }: any) {
      return (
        <td className="border border-border px-4 py-2 text-foreground">
          {children}
        </td>
      );
    },
    h1({ children }: any) {
      return (
        <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground border-b-2 border-border pb-2">
          {children}
        </h1>
      );
    },
    h2({ children }: any) {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground">
          {children}
        </h2>
      );
    },
    h3({ children }: any) {
      return (
        <h3 className="text-xl font-medium mt-5 mb-2 text-foreground">
          {children}
        </h3>
      );
    },
    h4({ children }: any) {
      return (
        <h4 className="text-lg font-medium mt-4 mb-2 text-foreground">
          {children}
        </h4>
      );
    },
    h5({ children }: any) {
      return (
        <h5 className="text-base font-medium mt-3 mb-1 text-foreground">
          {children}
        </h5>
      );
    },
    h6({ children }: any) {
      return (
        <h6 className="text-sm font-medium mt-2 mb-1 text-foreground">
          {children}
        </h6>
      );
    },
    p({ children }: any) {
      return (
        <p className="mb-4 leading-relaxed text-foreground">
          {children}
        </p>
      );
    },
    ul({ children }: any) {
      return (
        <ul className="mb-4 space-y-1 text-foreground">
          {children}
        </ul>
      );
    },
    ol({ children }: any) {
      return (
        <ol className="mb-4 space-y-1 text-foreground list-decimal list-inside">
          {children}
        </ol>
      );
    },
    li({ children }: any) {
      return (
        <li className="leading-relaxed">
          {children}
        </li>
      );
    },
    a({ children, href }: any) {
      return (
        <a 
          href={href} 
          className="text-primary hover:text-primary/80 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
    strong({ children }: any) {
      return (
        <strong className="font-semibold text-foreground">
          {children}
        </strong>
      );
    },
    em({ children }: any) {
      return (
        <em className="italic text-foreground">
          {children}
        </em>
      );
    },
    del({ children }: any) {
      return (
        <del className="line-through text-muted-foreground">
          {children}
        </del>
      );
    },
    img({ src, alt }: any) {
      return (
        <div className="my-6">
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full h-auto rounded-lg border border-border shadow-sm"
          />
          {alt && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {alt}
            </p>
          )}
        </div>
      );
    },
    hr() {
      return (
        <hr className="my-8 border-border" />
      );
    }
  };

  return (
    <div className={`prose prose-sm max-w-none overflow-x-auto ${className}`} style={{ minWidth: 0, width: '100%' }}>
      {content ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2 text-foreground">暂无内容</h3>
          <p className="text-sm">开始编写Markdown内容，这里将显示实时预览</p>
        </div>
      )}
    </div>
  );
}