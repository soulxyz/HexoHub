
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">页面未找到</h2>
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在。
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            请检查您输入的URL是否正确，或者返回首页重新开始。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-center"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
