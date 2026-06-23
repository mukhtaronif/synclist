// Normalize track names for better matching

export const normalizeTrackName = (name) => {
  if (!name) return '';

  let normalized = name;

  // Remove common suffixes and variations
  const patterns = [
    /\s*\(Remaster(ed)?\)/gi,
    /\s*\(Re-master(ed)?\)/gi,
    /\s*-\s*Remaster(ed)?/gi,
    /\s*\(feat\.?\s+[^)]+\)/gi,
    /\s*feat\.?\s+.+$/gi,
    /\s*\(ft\.?\s+[^)]+\)/gi,
    /\s*ft\.?\s+.+$/gi,
    /\s*\(featuring\s+[^)]+\)/gi,
    /\s*-\s*Live/gi,
    /\s*\(Live\)/gi,
    /\s*\(.*?\s*Version\)/gi,
    /\s*-\s*.*?\s*Version/gi,
    /\s*\(Radio Edit\)/gi,
    /\s*-\s*Radio Edit/gi,
    /\s*\(Explicit\)/gi,
    /\s*\(Clean\)/gi,
    /\s*\(Album Version\)/gi,
    /\s*\(Single Version\)/gi,
    /\s*\(Official\s+.*?\)/gi,
    /\s*\(\d{4}\s+Remaster\)/gi,
    /\s*-\s*\d{4}\s+Remaster/gi,
  ];

  patterns.forEach(pattern => {
    normalized = normalized.replace(pattern, '');
  });

  // Trim whitespace and lowercase
  normalized = normalized.trim().toLowerCase();

  return normalized;
};

export const normalizeArtistName = (artist) => {
  if (!artist) return '';

  // Lowercase and trim
  return artist.trim().toLowerCase();
};

// Calculate string similarity using Levenshtein distance
export const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  const distance = costs[s2.length];
  return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
};
