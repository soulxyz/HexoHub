
'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getTexts, Language } from '@/utils/i18n';
import {
  Bold,
  Italic,
  Code,
  Quote,
  List,
  ListOrdered,
  Link,
  Image,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Minus
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  language?: 'zh' | 'en';
}

export function MarkdownEditor({ value, onChange, isLoading = false, language = 'zh' }: MarkdownEditorProps) {
  const [lineNumbers, setLineNumbers] = useState<string[]>(['1']);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = getTexts(language as Language);

  const insertTextAtCursor = (insertText: string, selectionStart?: number, selectionEnd?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionStart ?? textarea.selectionStart;
    const end = selectionEnd ?? textarea.selectionEnd;
    const currentValue = value;

    const newValue = currentValue.substring(0, start) + insertText + currentValue.substring(end);
    onChange(newValue);

    setTimeout(() => {
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const wrapSelectedText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const wrappedText = prefix + selectedText + (suffix || prefix);

    const newValue = value.substring(0, start) + wrappedText + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      if (selectedText.length === 0) {
        const newPos = start + prefix.length;
        textarea.setSelectionRange(newPos, newPos);
      } else {
        textarea.setSelectionRange(start, start + wrappedText.length);
      }
      textarea.focus();
    }, 0);
  };

  const handleBold = () => wrapSelectedText('**');
  const handleItalic = () => wrapSelectedText('*');
  const handleCode = () => wrapSelectedText('`');
  const handleCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const selectedText = value.substring(textarea.selectionStart, textarea.selectionEnd) || 'code here';
    const codeBlock = `
\`\`\`javascript
${selectedText}
\`\`\`
`;
    insertTextAtCursor(codeBlock, start, textarea.selectionEnd);
  };

  const handleQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const selectedText = value.substring(textarea.selectionStart, textarea.selectionEnd);
    const lines = selectedText.split('\n');
    const quotedLines = lines.map(line => '> ' + line).join('\n');
    const newValue = value.substring(0, start) + quotedLines + value.substring(textarea.selectionEnd);
    onChange(newValue);
  };

  const handleUnorderedList = () => insertTextAtCursor('\n- ');
  const handleOrderedList = () => insertTextAtCursor('\n1. ');
  const handleLink = () => wrapSelectedText('[', '](url)');
  const handleImage = () => insertTextAtCursor('![alt text](image-url)');
  const handleTable = () => {
    const table = '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n';
    insertTextAtCursor(table);
  };
  const handleHeading1 = () => insertTextAtCursor('\n# ');
  const handleHeading2 = () => insertTextAtCursor('\n## ');
  const handleHeading3 = () => insertTextAtCursor('\n### ');
  const handleHorizontalRule = () => insertTextAtCursor('\n---\n');

useEffect(() => {
  const lines = value.split('\n');
  setLineNumbers(lines.map((_, index) => (index + 1).toString()));
}, [value]);


  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbersElement = document.getElementById('line-numbers');
    if (lineNumbersElement) {
      lineNumbersElement.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const insertImageAtCursor = (fileName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const imageTag = `{% asset_img ${fileName} "图片描述" %}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + imageTag + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      const newCursorPos = start + imageTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name)
    );

    if (imageFiles.length > 0) {
      imageFiles.forEach((file, index) => {
        setTimeout(() => {
          insertImageAtCursor(file.name);
        }, index * 50);
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b p-3 bg-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-foreground">
            <span>{t.markdownEditor}</span>
            <span className="text-xs bg-background border px-2 py-1 rounded">
              {lineNumbers.length} {t.lines}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{t.supportMarkdownSyntax}</span>
          </div>
        </div>
      </div>

      <div className="border-b bg-background px-3 py-2 flex items-center space-x-1 overflow-x-auto sticky top-0 z-10">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={handleHeading1} title="标题 1" className="h-8 w-8 p-0">
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleHeading2} title="标题 2" className="h-8 w-8 p-0">
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleHeading3} title="标题 3" className="h-8 w-8 p-0">
            <Heading3 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="ghost" size="sm" onClick={handleBold} title="粗体" className="h-8 w-8 p-0">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleItalic} title="斜体" className="h-8 w-8 p-0">
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCode} title="行内代码" className="h-8 w-8 p-0">
            <Code className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="ghost" size="sm" onClick={handleUnorderedList} title="无序列表" className="h-8 w-8 p-0">
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOrderedList} title="有序列表" className="h-8 w-8 p-0">
            <ListOrdered className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="ghost" size="sm" onClick={handleLink} title="链接" className="h-8 w-8 p-0">
            <Link className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleImage} title="图片" className="h-8 w-8 p-0">
            <Image className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleTable} title="表格" className="h-8 w-8 p-0">
            <Table className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="ghost" size="sm" onClick={handleQuote} title="引用" className="h-8 w-8 p-0">
            <Quote className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCodeBlock} title="代码块" className="h-8 w-8 p-0">
            <Code className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleHorizontalRule} title="分割线" className="h-8 w-8 p-0">
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex relative" style={{ minWidth: 0, maxWidth: '100%' }}>
        <div
          id="line-numbers"
          className="w-12 bg-muted border-r text-muted-foreground text-sm font-mono text-right pr-2 pt-2 select-none overflow-hidden flex-shrink-0"
        >
          {lineNumbers.map((lineNumber, index) => (
            <div key={index} className="leading-6">
              {lineNumber}
            </div>
          ))}
        </div>

        <div
          className={`flex-1 relative min-w-0 overflow-hidden \${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onScroll={handleTextareaScroll}
            placeholder={t.editorPlaceholder}
            className="w-full h-full p-2 font-mono text-sm resize-none border-0 rounded-none focus:ring-0 overflow-x-auto"
            disabled={isLoading}
            style={{
              minHeight: '400px',
              lineHeight: '1.5',
              outline: 'none',
              width: '100%',
              minWidth: 0,
              overflow: 'auto',
              wordBreak: 'break-all'
            }}
          />
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-blue-600 text-lg font-medium">
                {t.dropImagesHere || '拖放图片到这里'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
