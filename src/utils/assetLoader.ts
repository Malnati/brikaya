// src/utils/assetLoader.ts
import {
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from '../constants/appearance';
import { getRuntimeVisualAssetPathsForImageSet } from './visualAssetResolver';
import { LOG, ERROR, WARN } from './logger';

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
      
      // Adicionar timeout para evitar travamento
      const timeout = setTimeout(() => {
        ERROR(`Timeout ao carregar imagem: ${path}`);
        this.loadPromises.delete(path);
        reject(new Error(`Timeout loading image: ${path}`));
      }, 10000); // 10 segundos de timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        LOG(`✅ Imagem carregada com sucesso: ${path}`);
        this.imageCache.set(path, img);
        this.loadPromises.delete(path);
        resolve(img);
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        ERROR(`❌ Erro ao carregar imagem: ${path}`, error);
        this.loadPromises.delete(path);
        reject(new Error(`Failed to load image: ${path}`));
      };
      
      // Definir src após configurar os event listeners
      img.src = path;
    });

    this.loadPromises.set(path, promise);
    return promise;
  }

  static async preloadImageSet(imageSetId: ImageSetId): Promise<void> {
    const assetPaths = getRuntimeVisualAssetPathsForImageSet(imageSetId);
    LOG('🔄 Carregando assets:', assetPaths);

    const results = await Promise.allSettled(
      assetPaths.map(path => this.preloadImage(path))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    LOG(`📊 Resultado do carregamento: ${successful} sucessos, ${failed} falhas`);

    if (failed > 0) {
      WARN('⚠️  Algumas imagens falharam ao carregar, mas o jogo continuará com fallback');
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          ERROR(`  ❌ Falha: ${assetPaths[index]} - ${result.reason}`);
        }
      });
    } else {
      LOG('✅ Todos os assets carregados com sucesso!');
    }
  }

  static async preloadAllAssets(
    imageSetId: ImageSetId = IMAGE_SET_RETRO_DEFAULT,
  ): Promise<void> {
    await this.preloadImageSet(imageSetId);
  }

  static getImage(path: string): HTMLImageElement | null {
    const image = this.imageCache.get(path) || null;
    if (!image) {
      WARN(`Imagem não encontrada no cache: ${path}`);
    }
    return image;
  }
}
