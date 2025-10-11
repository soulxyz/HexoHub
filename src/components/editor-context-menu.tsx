'use client';

import { useState } from 'react';
import {
  Menu,
  Item,
  Separator,
  Submenu,
  useContextMenu
} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
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

const MENU_ID = 'editor-context-menu';

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
  const { show } = useContextMenu({ id: MENU_ID });

  const hasSelection = selectedText && selectedText.trim().length > 0;
  const canUseAI = enableAI && apiKey && hasSelection;

  const openRewriteDialog = (type: 'rewrite' | 'improve' | 'translate' | 'expand') => {
    setRewriteType(type);
    setDialogOpen(true);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    show({
      event,
      props: {
        selectedText,
        hasSelection,
        canUseAI
      }
    });
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>

      <Menu id={MENU_ID} className="context-menu">
        {/* AI功能区 */}
        {enableAI && (
          <>
            <Submenu
              label={
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  {language === 'zh' ? 'AI 工具' : 'AI Tools'}
                </div>
              }
            >
              {canUseAI ? (
                <>
                  <Item onClick={() => openRewriteDialog('rewrite')}>
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      {t.aiRewrite}
                    </div>
                  </Item>
                  <Item onClick={() => openRewriteDialog('improve')}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t.aiImprove}
                    </div>
                  </Item>
                  <Item onClick={() => openRewriteDialog('expand')}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t.aiExpand}
                    </div>
                  </Item>
                  <Item onClick={() => openRewriteDialog('translate')}>
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      {t.aiTranslate}
                    </div>
                  </Item>
                </>
              ) : (
                <Item disabled>
                  {!apiKey
                    ? t.pleaseConfigureApiKey
                    : t.pleaseSelectText}
                </Item>
              )}
            </Submenu>
            <Separator />
          </>
        )}

        {/* 编辑功能区 */}
        <Item onClick={onCopy} disabled={!hasSelection}>
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            {language === 'zh' ? '复制' : 'Copy'}
          </div>
        </Item>
        <Item onClick={onCut} disabled={!hasSelection}>
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            {language === 'zh' ? '剪切' : 'Cut'}
          </div>
        </Item>
        <Item onClick={onPaste}>
          <div className="flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            {language === 'zh' ? '粘贴' : 'Paste'}
          </div>
        </Item>
        <Item onClick={onSelectAll}>
          <div className="flex items-center gap-2">
            <SquareStack className="w-4 h-4" />
            {language === 'zh' ? '全选' : 'Select All'}
          </div>
        </Item>

        <Separator />

        {/* Markdown 格式化 */}
        <Submenu
          label={
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {language === 'zh' ? 'Markdown 格式' : 'Markdown Format'}
            </div>
          }
          disabled={!hasSelection}
        >
          <Item onClick={() => onFormat('bold')}>
            <div className="flex items-center gap-2">
              <Bold className="w-4 h-4" />
              {language === 'zh' ? '粗体' : 'Bold'}
            </div>
          </Item>
          <Item onClick={() => onFormat('italic')}>
            <div className="flex items-center gap-2">
              <Italic className="w-4 h-4" />
              {language === 'zh' ? '斜体' : 'Italic'}
            </div>
          </Item>
          <Item onClick={() => onFormat('code')}>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              {language === 'zh' ? '行内代码' : 'Inline Code'}
            </div>
          </Item>
          <Item onClick={() => onFormat('link')}>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              {language === 'zh' ? '链接' : 'Link'}
            </div>
          </Item>
          <Separator />
          <Item onClick={() => onFormat('ul')}>
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" />
              {language === 'zh' ? '无序列表' : 'Unordered List'}
            </div>
          </Item>
          <Item onClick={() => onFormat('ol')}>
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              {language === 'zh' ? '有序列表' : 'Ordered List'}
            </div>
          </Item>
        </Submenu>
      </Menu>

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
