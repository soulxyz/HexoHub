
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到外部服务
    console.error('应用错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">出错了！</h2>
          <p className="text-muted-foreground">
            应用程序遇到了一个错误。我们已经记录了这个问题。
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm font-mono text-destructive break-words">
            {error.message || '未知错误'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              错误ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
