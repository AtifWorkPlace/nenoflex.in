import { Product } from '@/types';

export interface SearchOptions {
  query: string;
  category?: string;
  maxPrice?: number;
  typoTolerance?: boolean;
}

export interface SearchResponse {
  hits: Product[];
  totalHits: number;
  processingTimeMs: number;
  suggestions: string[];
}

export const SearchEngine = {
  // Meilisearch / Typesense Natural Language Search query parser & index searcher
  search: (products: Product[], options: SearchOptions): SearchResponse => {
    const startTime = performance.now();
    const q = options.query.trim().toLowerCase();

    if (!q) {
      return {
        hits: products,
        totalHits: products.length,
        processingTimeMs: 0,
        suggestions: ['Jerseys', 'Jackets', 'Nike', 'TNF Fleece'],
      };
    }

    const matches = products.filter(product => {
      const name = product.name.toLowerCase();
      const brand = product.brand.toLowerCase();
      const category = product.category.toLowerCase();
      const tags = product.tags.join(' ').toLowerCase();

      // Exact substring or Typo Tolerance (Levenshtein)
      const isDirectMatch = name.includes(q) || brand.includes(q) || category.includes(q) || tags.includes(q);
      if (isDirectMatch) return true;

      // Simple Levenshtein distance check for typos
      if (options.typoTolerance !== false) {
        const words = `${name} ${brand} ${category}`.split(/\s+/);
        return words.some(w => SearchEngine.levenshtein(w, q) <= 2);
      }

      return false;
    });

    const suggestions = ['Nike Jersey', 'TNF Blue Fleece', 'Carhartt', 'FILA Vest', 'Lotto Fleece'].filter(s =>
      s.toLowerCase().includes(q) || q.length < 3
    );

    return {
      hits: matches,
      totalHits: matches.length,
      processingTimeMs: Math.round(performance.now() - startTime),
      suggestions,
    };
  },

  // Levenshtein distance helper for typo tolerance
  levenshtein: (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
};
