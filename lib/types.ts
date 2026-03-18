export type Recipe = {
  id: string;
  title: string;
  details: string;
  thumbnailPath: string; // e.g. /thumbnails/xxxx.svg
  referenceImages?: string[]; // 参考画像の配列（Base64 Data URL）
  createdAt: string; // ISO string
};

export type CreateRecipeRequest = {
  title: string;
  details: string;
  imageUrl?: string; // アップロードされた画像のURL
};

export type CreateRecipeResponse = {
  recipe: Recipe;
};

export type ListRecipesResponse = {
  recipes: Recipe[];
};
