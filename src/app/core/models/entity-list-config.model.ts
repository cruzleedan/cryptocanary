export interface EntityListConfig {
  type: string;

  filters: {
    category?: string,
    author?: string,
    rating?: string,
    limit?: number,
    offset?: number
  };
}
