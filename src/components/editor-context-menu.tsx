'use client';

import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { 
  Wand2, Languages, FileText, Sparkles,
  Copy, Scissors, Clipboard, SquareStack,
  Bold, Italic, Code, Link2, List, ListOrdered
} from 'lucide-react';
import { getTexts } from '@/utils/i18n';
import { AIRewriteDialog } from '@/components/ai-rewrite-dialog';

interface EditorContextMenuProps {
  children: React.ReactNode;
  selectedText: string;
  onRewrite: (rewrittenText: string) => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onFormat: (format: string) => void;
  aiProvider: 'deepseek' | 'openai' | 'siliconflow';
  apiKey: string;
  language: 'zh' | 'en';
  openaiModel?: string;
  openaiApiEndpoint?: string;
  enableAI?: boolean;
}

export function EditorContextMenu({
  children,
  selectedText,
  onRewrite,
  onCopy,
  onCut,
  onPaste,
  onSelectAll,
  onFormat,
  aiProvider,
  apiKey,
  language,
  openaiModel = 'gpt-3.5-turbo',
  openaiApiEndpoint = 'https://api.openai.com/v1',
  enableAI = false
}: EditorContextMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rewriteType, setRewriteType] = useState<'rewrite' | 'improve' | 'translate' | 'expand' | null>(null);
  const t = getTexts(language);

  const hasSelection = selectedText && selectedText.trim().length > 0;
  const canUseAI = enableAI && apiKey && hasSelection;

  const openRewriteDialog = (type: 'rewrite' | 'improve' | 'translate' | 'expand') => {
    setRewriteType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {/* AI功能区 */}
          {enableAI && (
            <>
              <ContextMenuSub>
                <ContextMenuSubTrigger className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  {language === 'zh' ? 'AI 工具' : 'AI Tools'}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-56">
                  {canUseAI ? (
                    <>
                      <ContextMenuItem
                        onClick={() => openRewriteDialog('rewrite')}
                        className="flex items-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        {t.aiRewrite}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => openRewriteDialog('improve')}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {t.aiImprove}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => openRewriteDialog('expand')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {t.aiExpand}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => openRewriteDialog('translate')}
                        className="flex items-center gap-2"
                      >
                        <Languages className="w-4 h-4" />
                        {t.aiTranslate}
                      </ContextMenuItem>
                    </>
                  ) : (
                    <ContextMenuItem disabled>
                      {!apiKey
                        ? t.pleaseConfigureApiKey
                        : t.pleaseSelectText}
                    </ContextMenuItem>
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
            </>
          )}

          {/* 编辑功能区 */}
          <ContextMenuItem
            onClick={onCopy}
            disabled={!hasSelection}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {language === 'zh' ? '复制' : 'Copy'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={onCut}
            disabled={!hasSelection}
            className="flex items-center gap-2"
          >
            <Scissors className="w-4 h-4" />
            {language === 'zh' ? '剪切' : 'Cut'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={onPaste}
            className="flex items-center gap-2"
          >
            <Clipboard className="w-4 h-4" />
            {language === 'zh' ? '粘贴' : 'Paste'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={onSelectAll}
            className="flex items-center gap-2"
          >
            <SquareStack className="w-4 h-4" />
            {language === 'zh' ? '全选' : 'Select All'}
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Markdown 格式化 */}
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!hasSelection} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {language === 'zh' ? 'Markdown 格式' : 'Markdown Format'}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56">
              <ContextMenuItem onClick={() => onFormat('bold')} className="flex items-center gap-2">
                <Bold className="w-4 h-4" />
                {language === 'zh' ? '粗体' : 'Bold'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onFormat('italic')} className="flex items-center gap-2">
                <Italic className="w-4 h-4" />
                {language === 'zh' ? '斜体' : 'Italic'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onFormat('code')} className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                {language === 'zh' ? '行内代码' : 'Inline Code'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onFormat('link')} className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                {language === 'zh' ? '链接' : 'Link'}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onFormat('ul')} className="flex items-center gap-2">
                <List className="w-4 h-4" />
                {language === 'zh' ? '无序列表' : 'Unordered List'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onFormat('ol')} className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4" />
                {language === 'zh' ? '有序列表' : 'Ordered List'}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>

      {/* AI 改写预览对话框 */}
      <AIRewriteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedText={selectedText}
        rewriteType={rewriteType}
        onAccept={onRewrite}
        aiProvider={aiProvider}
        apiKey={apiKey}
        language={language}
        openaiModel={openaiModel}
        openaiApiEndpoint={openaiApiEndpoint}
      />
    </>
  );
}

