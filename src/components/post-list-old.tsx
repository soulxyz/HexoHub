'use client';

import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FileText, Calendar, File } from 'lucide-react';

interface Post {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
}

interface PostListProps {
  posts: Post[];
  selectedPost: Post | null;
  onPostSelect: (post: Post) => void;
  isLoading?: boolean;
}

export function PostList({ posts, selectedPost, onPostSelect, isLoading = false }: PostListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: zhCN
      });
    } catch {
      return '未知时间';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500 text-sm">加载中...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
        <File className="w-8 h-8 mb-2" />
        <div className="text-sm">暂无文章</div>
        <div className="text-xs mt-1">点击 + 按钮创建新文章</div>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {posts.map((post) => (
        <div
          key={post.path}
          className={`p-3 cursor-pointer border rounded-lg transition-colors hover:bg-gray-50 ${
            selectedPost?.path === post.path
              ? 'bg-blue-50 border-blue-200'
              : 'border-gray-200'
          }`}
          onClick={() => onPostSelect(post)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {post.name.replace(/\.(md|markdown)$/, '')}
                </h3>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.modifiedTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <File className="w-3 h-3" />
                  <span>{formatFileSize(post.size)}</span>
                </div>
              </div>
            </div>
            
            {selectedPost?.path === post.path && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}