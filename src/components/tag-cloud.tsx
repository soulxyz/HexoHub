
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface TagCloudProps {
  tags: string[];
  language: 'zh' | 'en';
}

interface TagCount {
  tag: string;
  count: number;
}

// 生成随机颜色
const getRandomColor = () => {
  const colors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-cyan-100 text-cyan-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 生成随机大小
const getRandomSize = (count: number, maxCount: number) => {
  // 根据标签使用频率计算相对大小，范围从0.8到2.0
  const baseSize = 0.8;
  const sizeRange = 1.2;
  const ratio = count / maxCount;
  return baseSize + (sizeRange * ratio);
};

export const TagCloud: React.FC<TagCloudProps> = ({ tags, language }) => {
  const [tagCounts, setTagCounts] = useState<TagCount[]>([]);
  const [maxCount, setMaxCount] = useState<number>(1);

  // 计算每个标签的使用次数
  useEffect(() => {
    if (!tags || tags.length === 0) {
      setTagCounts([]);
      return;
    }

    // 统计标签出现次数
    const countMap: Record<string, number> = {};
    tags.forEach(tag => {
      countMap[tag] = (countMap[tag] || 0) + 1;
    });

    // 转换为数组并排序
    const counts = Object.keys(countMap).map(tag => ({
      tag,
      count: countMap[tag]
    })).sort((a, b) => b.count - a.count);

    setTagCounts(counts);

    // 找出最大计数，用于计算相对大小
    if (counts.length > 0) {
      setMaxCount(counts[0].count);
    }
  }, [tags]);

  if (tagCounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            {language === 'zh' ? '标签云图' : 'Tag Cloud'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-500">
            {language === 'zh' ? '暂无标签数据' : 'No tag data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          {language === 'zh' ? '标签云图' : 'Tag Cloud'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 p-4 justify-center">
          {tagCounts.map((item, index) => {
            const colorClass = getRandomColor();
            const size = getRandomSize(item.count, maxCount);

            return (
              <Badge
                key={index}
                variant="outline"
                className={`${colorClass} cursor-pointer transition-all hover:opacity-80`}
                style={{ 
                  fontSize: `${size}rem`,
                  padding: `${0.25 * size}rem ${0.5 * size}rem`
                }}
                title={`${language === 'zh' ? '使用次数' : 'Used'}: ${item.count}`}
              >
                {item.tag}
              </Badge>
            );
          })}
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          {language === 'zh' 
            ? `共 ${tagCounts.length} 个标签，${tags.length} 次使用` 
            : `${tagCounts.length} tags, ${tags.length} uses total`}
        </div>
      </CardContent>
    </Card>
  );
};
