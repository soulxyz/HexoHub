import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown } from 'lucide-react';
import { Language, getTexts } from '@/utils/i18n';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (postData: {
    title: string;
    tags: string[];
    categories: string[];
    excerpt?: string;
  }) => void;
  isLoading?: boolean;
  availableTags?: string[];
  availableCategories?: string[];
  language?: Language;
}

export function CreatePostDialog({ open, onOpenChange, onConfirm, isLoading = false, availableTags = [], availableCategories = [], language = 'zh' }: CreatePostDialogProps) {
  const texts = getTexts(language);
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleSelectExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCategory = () => {
    const trimmedCategory = categoryInput.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories([...categories, trimmedCategory]);
      setCategoryInput('');
    }
  };

  const handleSelectExistingCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
    setShowCategoryDropdown(false);
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCategoryInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleConfirm = () => {
    if (!title.trim()) {
      alert(texts.pleaseEnterArticleTitle);
      return;
    }

    onConfirm({
      title: title.trim(),
      tags,
      categories,
      excerpt: excerpt.trim() || undefined
    });

    // 重置表单
    setTitle('');
    setTags([]);
    setCategories([]);
    setExcerpt('');
    setTagInput('');
    setCategoryInput('');
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCancel = () => {
    // 重置表单
    setTitle('');
    setTags([]);
    setCategories([]);
    setExcerpt('');
    setTagInput('');
    setCategoryInput('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>{texts.createNewArticle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文章标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">{texts.articleTitle} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={texts.pleaseEnterArticleTitle || "请输入文章标题"}
              disabled={isLoading}
            />
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>{texts.tags}</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1" ref={tagDropdownRef}>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder={texts.pleaseEnterTags}
                  disabled={isLoading}
                  className="flex-1"
                  onFocus={() => setShowTagDropdown(true)}
                />
                {availableTags.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
                    {showTagDropdown && availableTags
                      .map(tag => (
                        <div
                          key={tag}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 dark:text-white dark:hover:bg-gray-700"
                          onClick={() => handleSelectExistingTag(tag)}
                        >
                          {tag}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                disabled={isLoading || availableTags.length === 0}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={isLoading || !tagInput.trim()}
              >
                {texts.add}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label>{texts.categories}</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1" ref={categoryDropdownRef}>
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={handleCategoryInputKeyPress}
                  placeholder={texts.pleaseEnterCategories}
                  disabled={isLoading}
                  className="flex-1"
                  onFocus={() => setShowCategoryDropdown(true)}
                />
                {availableCategories.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
                    {showCategoryDropdown && availableCategories
                      .map(category => (
                        <div
                          key={category}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 dark:text-white dark:hover:bg-gray-700"
                          onClick={() => handleSelectExistingCategory(category)}
                        >
                          {category}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={isLoading || availableCategories.length === 0}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                disabled={isLoading || !categoryInput.trim()}
              >
                {texts.add}
              </Button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => (
                  <Badge key={category} variant="outline" className="flex items-center gap-1">
                    {category}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setCategories(categories.filter(c => c !== category))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 摘要 */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">{texts.excerpt}（{texts.optional || "可选"}）</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={texts.pleaseEnterExcerpt}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {texts.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? texts.creating : texts.createArticle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}