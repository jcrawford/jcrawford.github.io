import React from "react";
import { formatDate } from "../utils/dateUtils";
import { EyeIcon, MessageIcon, ClockIcon } from "../utils/icons";

export interface ArticleMetaProps {
  authorName?: string;
  publishedAt: string;
  viewCount: number;
  commentCount: number;
  readingTime?: number;
  byText?: string;
  variant?: "article" | "recipe";
}

const ArticleMeta: React.FC<ArticleMetaProps> = ({
  authorName,
  publishedAt,
  viewCount,
  commentCount,
  readingTime,
  byText = "By",
  variant = "article",
}) => {
  const metaClass = variant === "recipe" ? "recipe-meta" : "hm-article-meta";
  const separatorClass = variant === "recipe" ? "recipe-meta-separator" : "hm-article-meta-separator";
  const byClass = variant === "recipe" ? "recipe-meta-by" : "hm-article-meta-by";
  const authorClass = variant === "recipe" ? "recipe-author-name" : "hm-article-author-name";
  const dateClass = variant === "recipe" ? "recipe-date" : "hm-article-date";
  const viewsClass = variant === "recipe" ? "recipe-views" : "hm-article-views";
  const commentsClass = variant === "recipe" ? "recipe-comments" : "hm-article-comments";
  const readingTimeClass = variant === "recipe" ? "recipe-reading-time" : "hm-article-reading-time";

  return (
    <div className={metaClass}>
      {authorName && (
        <>
          <span className={byClass}>{byText}</span>
          <span className={authorClass}>{authorName}</span>
          <span className={separatorClass}>•</span>
        </>
      )}
      <time className={dateClass} dateTime={publishedAt}>
        {formatDate(publishedAt)}
      </time>
      <span className={separatorClass}>•</span>
      <span className={readingTimeClass}>
        <ClockIcon size={16} />
        {readingTime} min read
      </span>
      <span className={separatorClass}>•</span>
      <span className={viewsClass}>
        <EyeIcon size={16} />
        {viewCount.toLocaleString()}
      </span>
      <span className={separatorClass}>•</span>
      <span className={commentsClass}>
        <MessageIcon size={16} />
        {commentCount}
      </span>
    </div>
  );
};

export default ArticleMeta;