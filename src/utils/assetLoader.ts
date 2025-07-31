// src/utils/assetLoader.ts

import { ASSET_PATHS } from '../constants/assets';

export class AssetLoader {
  private static imageCache: Map<string, HTMLImageElement> = new Map();
  private static loadPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  static async preloadImage(path: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(path)) {
      return this.imageCache.get(path)!;
    }

    if (this.loadPromises.has(path)) {
      return this.loadPromises.get(path)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Imagem carregada com sucesso: ${path}`);
        this.imageCache.set(path, img);
        this.loadPromises.delete(path);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Erro ao carregar imagem: ${path}`);
        this.loadPromises.delete(path);
        reject(new Error(`Failed to load image: ${path}`));
      };
      img.src = path;
    });

    this.loadPromises.set(path, promise);
    return promise;
  }

  static async preloadAllAssets(): Promise<void> {
    const assetPaths = Object.values(ASSET_PATHS);
    console.log('Carregando assets:', assetPaths);
    try {
      await Promise.all(assetPaths.map(path => this.preloadImage(path)));
      console.log('Todos os assets carregados com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar assets:', error);
      throw error;
    }
  }

  static getImage(path: string): HTMLImageElement | null {
    const image = this.imageCache.get(path) || null;
    if (!image) {
      console.warn(`Imagem não encontrada no cache: ${path}`);
    }
    return image;
  }
}