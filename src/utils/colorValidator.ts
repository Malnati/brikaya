// src/utils/colorValidator.ts

import { BRICK_COLORS } from '../constants/assets';
import { AssetLoader } from './assetLoader';

export interface ColorValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  loadedImages: string[];
  failedImages: string[];
}

export class ColorValidator {
  private static readonly EXPECTED_COLORS = {
    '/assets/brick_red.png': '#ff0000',
    '/assets/brick_blue.png': '#0000ff', 
    '/assets/brick_green.png': '#00ff00',
    '/assets/brick_yellow.png': '#ffff00',
    '/assets/brick_purple.png': '#800080'
  };

  /**
   * Valida se as imagens dos bricks estão carregando corretamente
   */
  static async validateBrickColors(): Promise<ColorValidationResult> {
    const result: ColorValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      loadedImages: [],
      failedImages: []
    };

    console.log('🔍 Iniciando validação de cores dos bricks...');

    try {
      // Tentar carregar todas as imagens
      await AssetLoader.preloadAllAssets();
      
      // Verificar se cada imagem foi carregada
      for (const colorPath of BRICK_COLORS) {
        const image = AssetLoader.getImage(colorPath);
        
        if (image) {
          result.loadedImages.push(colorPath);
          console.log(`✅ Imagem carregada: ${colorPath}`);
        } else {
          result.failedImages.push(colorPath);
          result.errors.push(`Falha ao carregar imagem: ${colorPath}`);
          result.isValid = false;
          console.error(`❌ Falha ao carregar: ${colorPath}`);
        }
      }

      // Verificar se pelo menos uma imagem foi carregada
      if (result.loadedImages.length === 0) {
        result.errors.push('Nenhuma imagem de brick foi carregada com sucesso');
        result.isValid = false;
      }

      // Verificar se todas as imagens foram carregadas
      if (result.failedImages.length > 0) {
        result.warnings.push(`Algumas imagens falharam ao carregar: ${result.failedImages.join(', ')}`);
      }

      // Verificar se o fallback está funcionando (cor azul)
      if (result.failedImages.length > 0) {
        result.warnings.push('O jogo está usando fallback azul para bricks com falha de carregamento');
      }

    } catch (error) {
      result.errors.push(`Erro durante validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      result.isValid = false;
    }

    console.log('📊 Resultado da validação:', result);
    return result;
  }

  /**
   * Verifica se um elemento canvas contém pixels de uma cor específica
   */
  static checkCanvasForColor(canvas: HTMLCanvasElement, targetColor: string, tolerance: number = 10): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Converter cor alvo para RGB
    const targetRGB = this.hexToRgb(targetColor);
    if (!targetRGB) return false;

    // Verificar pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (this.isColorSimilar(r, g, b, targetRGB.r, targetRGB.g, targetRGB.b, tolerance)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifica se o jogo está renderizando bricks coloridos
   */
  static async validateGameRendering(canvas: HTMLCanvasElement): Promise<ColorValidationResult> {
    const result: ColorValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      loadedImages: [],
      failedImages: []
    };

    // Aguardar um pouco para o jogo renderizar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se há pixels azuis (fallback)
    const hasBluePixels = this.checkCanvasForColor(canvas, '#00d4ff', 20);
    
    if (hasBluePixels) {
      result.warnings.push('Detectados pixels azuis (fallback) - possivel problema com carregamento de imagens');
    }

    // Verificar se há pixels coloridos (bricks normais)
    const hasColoredPixels = 
      this.checkCanvasForColor(canvas, '#ff0000', 100) || // Vermelho
      this.checkCanvasForColor(canvas, '#0000ff', 100) || // Azul
      this.checkCanvasForColor(canvas, '#00ff00', 150) || // Verde
      this.checkCanvasForColor(canvas, '#ffff00', 100) || // Amarelo
      this.checkCanvasForColor(canvas, '#800080', 100);   // Roxo

    if (!hasColoredPixels && !hasBluePixels) {
      result.errors.push('Nenhum brick colorido detectado na tela');
      result.isValid = false;
    }

    if (hasColoredPixels) {
      result.loadedImages.push('Bricks coloridos detectados na tela');
    }

    return result;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private static isColorSimilar(
    r1: number, g1: number, b1: number,
    r2: number, g2: number, b2: number,
    tolerance: number
  ): boolean {
    return Math.abs(r1 - r2) <= tolerance &&
           Math.abs(g1 - g2) <= tolerance &&
           Math.abs(b1 - b2) <= tolerance;
  }
} 