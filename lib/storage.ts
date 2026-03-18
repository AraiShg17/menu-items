// Firestore版のstorage.tsに置き換え
export {
  readAllRecipes,
  writeAllRecipes,
  updateRecipe,
  deleteRecipe,
  ensureStorage,
} from "./firestore-storage";