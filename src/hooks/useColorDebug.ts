// src/hooks/useColorDebug.ts
import { useEffect, useRef } from 'react';
import { ColorValidator } from '../utils/colorValidator';
import { LOG, ERROR, WARN } from '../utils/logger';

export function useColorDebug(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const debugIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Função para verificar cores periodicamente
    const checkColors = async () => {
      try {
        const result = await ColorValidator.validateGameRendering(canvasRef.current!);
        
        if (!result.isValid || result.warnings.length > 0) {
          WARN('🚨 Problemas detectados com cores:', {
            isValid: result.isValid,
            errors: result.errors,
            warnings: result.warnings
          });
        } else {
          LOG('✅ Cores do jogo estão funcionando corretamente');
        }
      } catch (error) {
        ERROR('❌ Erro ao verificar cores:', error);
      }
    };

    // Verificar cores a cada 5 segundos
    debugIntervalRef.current = setInterval(checkColors, 5000);

    // Verificação inicial após 3 segundos
    setTimeout(checkColors, 3000);

    return () => {
      if (debugIntervalRef.current) {
        clearInterval(debugIntervalRef.current);
      }
    };
  }, [canvasRef]);

  // Função para verificação manual
  const manualCheck = async () => {
    if (!canvasRef.current) return;
    
    try {
      const result = await ColorValidator.validateGameRendering(canvasRef.current);
      LOG('🔍 Verificação manual de cores:', result);
      return result;
    } catch (error) {
      ERROR('❌ Erro na verificação manual:', error);
      return null;
    }
  };

  return { manualCheck };
} 