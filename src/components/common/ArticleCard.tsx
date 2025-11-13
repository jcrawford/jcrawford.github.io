import React from "react";
import { Link } from "gatsby";
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image";
import { formatDate, formatReadingTime } from "../../utils/formatters";

export interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage?: IGatsbyImageData;
    category: {
      name: string;
      slug: string;
      color: string;
    };
    author: {
      name: string;
      avatar?: IGatsbyImageData;
    };
    date: string;
    readingTime?: number;
  };
  variant?: "default" | "horizontal" | "minimal";
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = "default",
  showExcerpt = true,
  showAuthor = true,
  showReadingTime = true,
  className = "",
}) => {
  const cardClasses = {
    default: "flex flex-col",
    horizontal: "flex flex-row gap-4",
    minimal: "flex flex-col",
  };

  return (
    <article className={`bg-background-content border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${cardClasses[variant]} ${className}`}>
      {article.featuredImage && (
        <Link to={`/blog/${article.slug}`} className={variant === "horizontal" ? "w-1/3 flex-shrink-0" : "block"}>
          <GatsbyImage
            image={article.featuredImage}
            alt={article.title}
            className={
              variant === "horizontal" 
                ? "h-full" 
                : variant === "minimal"
                ? "w-full h-40 object-cover"
                : "w-full h-48 object-cover"
            }
          />
        </Link>
      )}

      <div className={`flex flex-col flex-grow ${variant === "minimal" ? "p-4" : "p-6"}`}>
        <Link
          to={`/blog/${article.category.slug}`}
          className="inline-block mb-3"
        >
          <span
            className="text-sm font-semibold uppercase px-3 py-1 rounded text-white"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </span>
        </Link>

        <Link to={`/blog/${article.slug}`}>
          <h3 className="text-xl font-bold text-text-headings hover:text-primary transition-colors mb-3 line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {showExcerpt && (
          <>
            <p className="text-text-light mb-3 line-clamp-3">
              {article.excerpt}
            </p>
            <Link
              to={`/blog/${article.slug}`}
              className="text-primary hover:underline font-semibold text-sm mb-4"
            >
              Read more
            </Link>
          </>
        )}

        <div className="mt-auto flex items-center justify-between text-sm text-text-light">
          {showAuthor && (
            <div className="flex items-center gap-2">
              {article.author.avatar && (
                <GatsbyImage
                  image={article.author.avatar}
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{article.author.name}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <time dateTime={article.date}>{formatDate(article.date, "MMM D, YYYY")}</time>
            {showReadingTime && article.readingTime && (
              <>
                <span>•</span>
                <span>{formatReadingTime(article.readingTime)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
