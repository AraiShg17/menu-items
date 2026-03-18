import { db } from "./firebase-admin";
import { Recipe } from "./types";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export async function readAllRecipes(): Promise<Recipe[]> {
  try {
    const snapshot = await db
      .collection("recipes")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        details: data.details,
        thumbnailPath: data.thumbnailPath,
        referenceImages: data.referenceImages || [],
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error reading recipes from Firestore:", error);
    return [];
  }
}

export async function writeAllRecipes(recipes: Recipe[]): Promise<void> {
  try {
    const batch = db.batch();

    // 新しいレシピを追加
    recipes.forEach((recipe) => {
      const docRef = db.collection("recipes").doc(recipe.id);
      const recipeData: any = {
        title: recipe.title,
        details: recipe.details,
        thumbnailPath: recipe.thumbnailPath,
        createdAt: Timestamp.fromDate(new Date(recipe.createdAt)),
        updatedAt: FieldValue.serverTimestamp(),
      };

      // referenceImagesが存在する場合は含める
      if (recipe.referenceImages !== undefined) {
        recipeData.referenceImages = recipe.referenceImages;
      }

      batch.set(docRef, recipeData);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error writing recipes to Firestore:", error);
    throw error;
  }
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  try {
    const docRef = db.collection("recipes").doc(recipe.id);
    const updateData: any = {
      title: recipe.title,
      details: recipe.details,
      thumbnailPath: recipe.thumbnailPath,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // referenceImagesが存在する場合は更新に含める
    if (recipe.referenceImages !== undefined) {
      updateData.referenceImages = recipe.referenceImages;
    }

    await docRef.update(updateData);
  } catch (error) {
    console.error("Error updating recipe in Firestore:", error);
    throw error;
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    const docRef = db.collection("recipes").doc(recipeId);
    await docRef.delete();
  } catch (error) {
    console.error("Error deleting recipe from Firestore:", error);
    throw error;
  }
}

export async function ensureStorage(): Promise<void> {
  // Firestoreは自動的にコレクションを作成するため、特別な処理は不要
  return Promise.resolve();
}
