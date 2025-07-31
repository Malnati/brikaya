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
        this.imageCache.set(path, img);
        this.loadPromises.delete(path);
        resolve(img);
      };
      img.onerror = () => {
        this.loadPromises.delete(path);
        reject(new Error(`Failed to load image: ${path}`));
      };
      img.src = path;
    });

    this.loadPromises.set(path, promise);
    return promise;
  }

  static async preloadAllAssets(): Promise<void> {
    const assetPaths = this.extractStringPaths(ASSET_PATHS);
    await Promise.all(assetPaths.map(path => this.preloadImage(path)));
  }

  private static extractStringPaths(obj: any): string[] {
    const paths: string[] = [];
    const traverse = (value: any) => {
      if (typeof value === 'string') {
        paths.push(value);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(traverse);
      }
    };
    traverse(obj);
    return paths;
  }
  static getImage(path: string): HTMLImageElement | null {
    return this.imageCache.get(path) || null;
  }
}