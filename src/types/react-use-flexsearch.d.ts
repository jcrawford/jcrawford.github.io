/**
 * Minimal type declarations for react-use-flexsearch (ships no .d.ts).
 * Hook signature per upstream README — index and store are accepted as
 * JSON strings (gatsby-plugin-local-search GraphQL) or parsed objects;
 * the library handles JSON.parse internally.
 *   useFlexSearch(query, index, store, optionalOptions) => TResult[]
 */
declare module 'react-use-flexsearch' {
  type Index = Record<number, string | number>;
  type Store = Record<number, Record<string, unknown>>;

  export function useFlexSearch<T = Record<string, unknown>>(
    query: string | number | Record<string, unknown>,
    index: Index | string,
    store: Store | string,
    options?: Record<string, unknown>
  ): T[];
}
