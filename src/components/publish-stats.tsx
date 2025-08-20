'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar } from 'lucide-react';

interface Post {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
}

interface PublishStatsProps {
  posts: Post[];
  language: 'zh' | 'en';
}

export function PublishStats({ posts, language }: PublishStatsProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 生成随机颜色
  const generateRandomColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    return colors;
  };

  // 处理文章数据，生成图表数据
  useEffect(() => {
    const processPosts = async () => {
      if (!posts || posts.length === 0) {
        setChartData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // 如果在Electron环境中，读取文件内容获取日期
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');

          // 按月份统计文章数量
          const monthCounts: Record<string, number> = {};

          for (const post of posts) {
            try {
              // 读取文件内容
              const content = await ipcRenderer.invoke('read-file', post.path);

              // 解析front matter中的日期
              const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
              if (frontMatterMatch) {
                const frontMatter = frontMatterMatch[1];

                // 提取日期
                const dateMatch = frontMatter.match(/^date:\s*(.+)$/m);
                if (dateMatch) {
                  const dateStr = dateMatch[1].trim();
                  const date = new Date(dateStr);

                  if (!isNaN(date.getTime())) {
                    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
                  }
                }
              }
            } catch (e) {
              console.error('Error processing post:', post.name, e);
            }
          }

          // 转换为图表数据格式并按时间排序
          const data = Object.entries(monthCounts)
            .map(([month, count]) => ({
              month,
              count
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

          setChartData(data);
          setColors(generateRandomColors(data.length));
        } else {
          // 非Electron环境，使用modifiedTime
          const monthCounts: Record<string, number> = {};

          posts.forEach(post => {
            try {
              const date = new Date(post.modifiedTime);
              if (!isNaN(date.getTime())) {
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
              }
            } catch (e) {
              console.error('Error parsing date:', post.modifiedTime, e);
            }
          });

          // 转换为图表数据格式并按时间排序
          const data = Object.entries(monthCounts)
            .map(([month, count]) => ({
              month,
              count
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

          setChartData(data);
          setColors(generateRandomColors(data.length));
        }
      } catch (error) {
        console.error('Error processing posts for stats:', error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    processPosts();
  }, [posts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          {language === 'zh' ? '发布统计' : 'Publish Statistics'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} 篇`, language === 'zh' ? '文章数量' : 'Article Count']}
                  labelFormatter={(label) => language === 'zh' ? `月份: ${label}` : `Month: ${label}`}
                  contentStyle={{
                    color: '#000',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#000' }}
                  labelStyle={{ color: '#000', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="count"
                  name={language === 'zh' ? '文章数量' : 'Article Count'}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'zh' ? '暂无数据' : 'No data available'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}