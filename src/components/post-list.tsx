'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FileText, Calendar, File, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

type SortField = 'name' | 'modifiedTime';
type SortOrder = 'asc' | 'desc';

export function PostList({ posts, selectedPost, onPostSelect, isLoading = false }: PostListProps) {
  const [sortField, setSortField] = useState<SortField>('modifiedTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  const sortPosts = (posts: Post[]) => {
    return [...posts].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, 'zh-CN');
      } else if (sortField === 'modifiedTime') {
        const aTime = new Date(a.modifiedTime).getTime();
        const bTime = new Date(b.modifiedTime).getTime();
        comparison = aTime - bTime;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'modifiedTime' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

  const getSortLabel = () => {
    const fieldName = sortField === 'name' ? '文件名' : '修改时间';
    const orderName = sortOrder === 'asc' ? '升序' : '降序';
    return `${fieldName} (${orderName})`;
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

  const sortedPosts = sortPosts(posts);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg">
        <div className="text-xs text-muted-foreground">
          共 {posts.length} 篇文章
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              {getSortIcon(sortField)}
              <span className="ml-1">{getSortLabel()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => handleSortChange('name')}
              className="flex items-center justify-between"
            >
              <span>按文件名</span>
              {getSortIcon('name')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange('modifiedTime')}
              className="flex items-center justify-between"
            >
              <span>按修改时间</span>
              {getSortIcon('modifiedTime')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto">
        {sortedPosts.map((post) => (
          <div
            key={post.path}
            className={`p-3 cursor-pointer border rounded-lg transition-colors hover:bg-muted/50 ${
              selectedPost?.path === post.path
                ? 'bg-primary/10 border-primary/20'
                : 'border-border'
            }`}
            onClick={() => onPostSelect(post)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {post.name.replace(/\.(md|markdown)$/, '')}
                  </h3>
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
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
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}