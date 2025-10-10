'use client';

import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Wand2, Languages, FileText, Sparkles } from 'lucide-react';
import { getTexts } from '@/utils/i18n';
import { AIRewriteDialog } from '@/components/ai-rewrite-dialog';

interface AIRewriteMenuProps {
  children: React.ReactNode;
  selectedText: string;
  onRewrite: (rewrittenText: string) => void;
  aiProvider: 'deepseek' | 'openai' | 'siliconflow';
  apiKey: string;
  language: 'zh' | 'en';
  openaiModel?: string;
  openaiApiEndpoint?: string;
  enabled?: boolean;
}

export function AIRewriteMenu({
  children,
  selectedText,
  onRewrite,
  aiProvider,
  apiKey,
  language,
  openaiModel = 'gpt-3.5-turbo',
  openaiApiEndpoint = 'https://api.openai.com/v1',
  enabled = true
}: AIRewriteMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rewriteType, setRewriteType] = useState<'rewrite' | 'improve' | 'translate' | 'expand' | null>(null);
  const t = getTexts(language);

  // 打开 AI 改写对话框
  const openRewriteDialog = (type: 'rewrite' | 'improve' | 'translate' | 'expand') => {
    setRewriteType(type);
    setDialogOpen(true);
  };

  // 如果没有启用AI或没有选中文本，则不显示AI选项
  const hasSelection = selectedText && selectedText.trim().length > 0;
  const canUseAI = enabled && apiKey && hasSelection;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
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
              {!enabled 
                ? t.aiFeatureNotEnabled
                : !apiKey
                ? t.pleaseConfigureApiKey
                : t.pleaseSelectText
              }
            </ContextMenuItem>
          )}
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

