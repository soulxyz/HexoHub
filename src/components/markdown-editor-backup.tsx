
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

  // 获取当前语言的文本
  const t = getTexts(language as Language);

  // 插入文本到光标位置的辅助函数
  const insertTextAtCursor = (insertText: string, selectionStart?: number, selectionEnd?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionStart ?? textarea.selectionStart;
    const end = selectionEnd ?? textarea.selectionEnd;
    const currentValue = value;

    const newValue = currentValue.substring(0, start) + insertText + currentValue.substring(end);
    onChange(newValue);

    // 设置新的光标位置
    setTimeout(() => {
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // 包装选中文本的辅助函数
  const wrapSelectedText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const wrappedText = prefix + selectedText + (suffix || prefix);

    const newValue = value.substring(0, start) + wrappedText + value.substring(end);
    onChange(newValue);

    // 设置新的光标位置
    setTimeout(() => {
      if (selectedText.length === 0) {
        // 如果没有选中文本，将光标放在标记内部
        const newPos = start + prefix.length;
        textarea.setSelectionRange(newPos, newPos);
      } else {
        // 如果有选中文本，选中包装后的文本
        textarea.setSelectionRange(start, start + wrappedText.length);
      }
      textarea.focus();
    }, 0);
  };

  // Markdown工具栏按钮处理函数
  const handleBold = () => wrapSelectedText('**');
  const handleItalic = () => wrapSelectedText('*');
  const handleCode = () => wrapSelectedText('`');
  const handleCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const codeBlock = '\n```javascript\n' + (value.substring(textarea.selectionStart, textarea.selectionEnd) || 'code here') + '\n```\n';
    insertTextAtCursor(codeBlock, start, textarea.selectionEnd);
  };

  const handleQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = value.substring(textarea.selectionStart, textarea.selectionEnd).split('\n');
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
    // 生成行号
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

  // 拖拽处理函数
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

  // 插入图片到光标位置
  const insertImageAtCursor = (fileName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const imageTag = `{% asset_img ${fileName} "图片描述" %}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + imageTag + value.substring(end);

    onChange(newValue);

    // 设置新的光标位置
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
      // 如果有多个图片文件，按顺序插入
      imageFiles.forEach((file, index) => {
        setTimeout(() => {
          insertImageAtCursor(file.name);
        }, index * 50); // 稍微延迟以确保顺序正确
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{t.markdownEditor}</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              {lineNumbers.length} {t.lines}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{t.supportMarkdownSyntax}</span>
          </div>
        </div>
      </div>

      {/* Markdown工具栏 */}
      <div className="border-b bg-white px-3 py-2 flex items-center space-x-1 overflow-x-auto sticky top-0 z-10">
        <div className="flex items-center space-x-1">
          {/* 标题按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHeading1}
            title="标题 1"
            className="h-8 w-8 p-0"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHeading2}
            title="标题 2"
            className="h-8 w-8 p-0"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHeading3}
            title="标题 3"
            className="h-8 w-8 p-0"
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 文本格式按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBold}
            title="粗体"
            className="h-8 w-8 p-0"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            title="斜体"
            className="h-8 w-8 p-0"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCode}
            title="行内代码"
            className="h-8 w-8 p-0"
          >
            <Code className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 列表按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnorderedList}
            title="无序列表"
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOrderedList}
            title="有序列表"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 插入元素按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLink}
            title="链接"
            className="h-8 w-8 p-0"
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImage}
            title="图片"
            className="h-8 w-8 p-0"
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTable}
            title="表格"
            className="h-8 w-8 p-0"
          >
            <Table className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 其他按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuote}
            title="引用"
            className="h-8 w-8 p-0"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCodeBlock}
            title="代码块"
            className="h-8 w-8 p-0"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHorizontalRule}
            title="分割线"
            className="h-8 w-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* 行号区域 */}
        <div
          id="line-numbers"
          className="w-12 bg-gray-50 border-r text-gray-400 text-sm font-mono text-right pr-2 pt-2 select-none overflow-hidden"
        >
          {lineNumbers.map((lineNumber, index) => (
            <div key={index} className="leading-6">
              {lineNumber}
            </div>
          ))}
        </div>

        {/* 编辑区域 */}
        <div
          className={`flex-1 relative ${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
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
            className="w-full h-full p-2 font-mono text-sm resize-none border-0 rounded-none focus:ring-0"
            disabled={isLoading}
            style={{
              minHeight: '400px',
              lineHeight: '1.5',
              outline: 'none'
            }}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-gray-500">{t.saving}</div>
            </div>
          )}

          {isDragOver && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center border-2 border-blue-300 border-dashed">
              <div className="text-blue-600 text-lg font-medium flex items-center space-x-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t.dragImageHint}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 状态栏 */}
      <div className="border-t p-2 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>字符数: {value.length}</span>
          <span>行数: {lineNumbers.length}</span>
        </div>
        <div>
          <span>Markdown 编辑器</span>
        </div>
      </div>
    </div>
  );
}

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

  // 获取当前语言的文本
  const t = getTexts(language as Language);

  // 插入文本到光标位置的辅助函数
  const insertTextAtCursor = (insertText: string, selectionStart?: number, selectionEnd?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionStart ?? textarea.selectionStart;
    const end = selectionEnd ?? textarea.selectionEnd;
    const currentValue = value;

    const newValue = currentValue.substring(0, start) + insertText + currentValue.substring(end);
    onChange(newValue);

    // 设置新的光标位置
    setTimeout(() => {
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // 包装选中文本的辅助函数
  const wrapSelectedText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const wrappedText = prefix + selectedText + (suffix || prefix);

    const newValue = value.substring(0, start) + wrappedText + value.substring(end);
    onChange(newValue);

    // 设置新的光标位置
    setTimeout(() => {
      if (selectedText.length === 0) {
        // 如果没有选中文本，将光标放在标记内部
        const newPos = start + prefix.length;
        textarea.setSelectionRange(newPos, newPos);
      } else {
        // 如果有选中文本，选中包装后的文本
        textarea.setSelectionRange(start, start + wrappedText.length);
      }
      textarea.focus();
    }, 0);
  };

  // Markdown工具栏按钮处理函数
  const handleBold = () => wrapSelectedText('**');
  const handleItalic = () => wrapSelectedText('*');
  const handleCode = () => wrapSelectedText('`');
  const handleCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const codeBlock = '
```javascript
' + (value.substring(textarea.selectionStart, textarea.selectionEnd) || 'code here') + '
```
';
    insertTextAtCursor(codeBlock, start, textarea.selectionEnd);
  };

  const handleQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = value.substring(textarea.selectionStart, textarea.selectionEnd).split('
');
    const quotedLines = lines.map(line => '> ' + line).join('
');
    const newValue = value.substring(0, start) + quotedLines + value.substring(textarea.selectionEnd);
    onChange(newValue);
  };

  const handleUnorderedList = () => insertTextAtCursor('
- ');
  const handleOrderedList = () => insertTextAtCursor('
1. ');
  const handleLink = () => wrapSelectedText('[', '](url)');
  const handleImage = () => insertTextAtCursor('![alt text](image-url)');
  const handleTable = () => {
    const table = '
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
';
    insertTextAtCursor(table);
  };
  const handleHeading1 = () => insertTextAtCursor('
# ');
  const handleHeading2 = () => insertTextAtCursor('
## ');
  const handleHeading3 = () => insertTextAtCursor('
### ');
  const handleHorizontalRule = () => insertTextAtCursor('
---
');

  useEffect(() => {
    // 生成行号
    const lines = value.split('\n');
    const numbers = lines.map((_, index) => String(index + 1));
    setLineNumbers(numbers);
  }, [value]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbersElement = document.getElementById('line-numbers');
    if (lineNumbersElement) {
      lineNumbersElement.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const insertImageAtCursor = (filename: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBefore = value.substring(0, cursorPosition);
    const textAfter = value.substring(cursorPosition);
    const imageMarkdown = `{% asset_img ${filename} %}`;

    const newValue = textBefore + imageMarkdown + textAfter;
    onChange(newValue);

    // 移动光标到插入内容的末尾
    setTimeout(() => {
      const newPosition = cursorPosition + imageMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
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

    // 只有当鼠标真正离开编辑区域时才隐藏拖拽状态
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name)
    );

    if (imageFiles.length > 0) {
      // 如果有多个图片文件，按顺序插入
      imageFiles.forEach((file, index) => {
        setTimeout(() => {
          insertImageAtCursor(file.name);
        }, index * 50); // 稍微延迟以确保顺序正确
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{t.markdownEditor}</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              {lineNumbers.length} {t.lines}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{t.supportMarkdownSyntax}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex relative">
        {/* 行号区域 */}
        <div 
          id="line-numbers"
          className="w-12 bg-gray-50 border-r text-gray-400 text-sm font-mono text-right pr-2 pt-2 select-none overflow-hidden"
        >
          {lineNumbers.map((lineNumber, index) => (
            <div key={index} className="leading-6">
              {lineNumber}
            </div>
          ))}
        </div>
        
        {/* 编辑区域 */}
        <div 
          className={`flex-1 relative ${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
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
            className="w-full h-full p-2 font-mono text-sm resize-none border-0 rounded-none focus:ring-0"
            disabled={isLoading}
            style={{
              minHeight: '100%',
              lineHeight: '1.5rem',
              tabSize: 2,
            }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-gray-500">{t.saving}</div>
            </div>
          )}

          {isDragOver && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center border-2 border-blue-300 border-dashed">
              <div className="text-blue-600 text-lg font-medium flex items-center space-x-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t.dragImageHint}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 状态栏 */}
      <div className="border-t p-2 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>Markdown</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln {lineNumbers.length}, Col 1</span>
          <span>Ctrl+S 保存</span>
        </div>
      </div>
    </div>
  );
}