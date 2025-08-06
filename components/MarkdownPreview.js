import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function MarkdownPreview({ content }) {
  if (!content) return null;

  return (
    <div className="prose prose-sm lg:prose-base max-w-none text-left">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]} // 👈 enables raw HTML rendering
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
