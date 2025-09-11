export type Recipe = {
  id: string;
  title: string;
  details: string;
  thumbnailPath: string; // e.g. /thumbnails/xxxx.svg
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
