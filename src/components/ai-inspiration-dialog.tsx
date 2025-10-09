
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Lightbulb, X } from 'lucide-react';
import { getTexts } from '@/utils/i18n';
import { isTauri } from '@/lib/desktop-api';

interface AIInspirationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiProvider: 'deepseek' | 'openai' | 'siliconflow';
  apiKey: string;
  prompt: string;
  language: 'zh' | 'en';
  openaiModel?: string;
  openaiApiEndpoint?: string;
}

export function AIInspirationDialog({ open, onOpenChange, aiProvider, apiKey, prompt, language, openaiModel = 'gpt-3.5-turbo', openaiApiEndpoint = 'https://api.openai.com/v1' }: AIInspirationDialogProps) {
  const [inspiration, setInspiration] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const t = getTexts(language);

  // 生成AI灵感
  const generateInspiration = async () => {
    if (!apiKey || !prompt) return;

    setIsGenerating(true);
    setInspiration('');
    setDisplayedText('');
    setIsTyping(false);

    try {
      // 根据提供商选择API端点和模型
      let apiUrl: string;
      let model: string;
      
      if (aiProvider === 'deepseek') {
        apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        model = 'deepseek-chat';
      } else if (aiProvider === 'siliconflow') {
        apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
        model = openaiModel || 'Qwen/Qwen2.5-7B-Instruct';
      } else {
        apiUrl = `${openaiApiEndpoint}/chat/completions`;
        model = openaiModel || 'gpt-3.5-turbo';
      }

      // 调用AI API - 在 Tauri 环境下使用 Tauri HTTP 插件
      let response;
      if (isTauri()) {
        const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
        response = await tauriFetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });
      } else {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      if (content) {
        setInspiration(content);
        setIsTyping(true);
      }
    } catch (error) {
      console.error('Error generating inspiration:', error);
      setInspiration(language === 'zh' 
        ? '生成灵感时出现错误，请检查API密钥是否正确。' 
        : 'An error occurred while generating inspiration, please check if the API key is correct.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 打字机效果
  useEffect(() => {
    if (isTyping && inspiration) {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }

      if (displayedText.length < inspiration.length) {
        typingRef.current = setTimeout(() => {
          setDisplayedText(inspiration.substring(0, displayedText.length + 1));
        }, 20);
      } else {
        setIsTyping(false);
      }
    }

    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, [isTyping, inspiration, displayedText]);

  // 对话框打开时自动生成灵感
  useEffect(() => {
    if (open) {
      generateInspiration();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            {t.aiInspiration}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.inspiration}</Label>
              {isGenerating && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  {t.generatingInspiration}
                </div>
              )}
            </div>
            <Textarea
              value={displayedText}
              readOnly
              className="min-h-[200px] resize-none"
              placeholder={t.aiInspirationDescription}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={generateInspiration}
              disabled={isGenerating || !apiKey}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.generatingInspiration}
                </>
              ) : (
                t.getInspiration
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
