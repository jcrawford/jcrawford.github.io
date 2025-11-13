import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (date: string, format: string = "MMMM D, YYYY"): string => {
  return dayjs(date).format(format);
};

export const formatDateRelative = (date: string): string => {
  return dayjs(date).fromNow();
};

export const formatReadingTime = (minutes: number): string => {
  return `${minutes} min read`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
};

