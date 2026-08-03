/**
 * Strip a series name prefix from an article title.
 * Handles patterns like "Series Name: Title", "Series Name - Title", "Series Name – Title".
 */
export function getDisplayTitle(title: string, seriesName: string): string {
  const patterns = [
    `${seriesName}: `,
    `${seriesName} - `,
    `${seriesName} – `,
    `${seriesName}: `,
  ];

  let cleanTitle = title;
  for (const pattern of patterns) {
    if (cleanTitle.startsWith(pattern)) {
      cleanTitle = cleanTitle.substring(pattern.length);
      break;
    }
  }

  return cleanTitle;
}