import * as debugLogger from '../storage/debugLogger'
import { isRuntimeDiagnosticsEnabled } from './runtimeDiagnostics'

export const LOG = (str: string, ...args: any[]) => {
  if (!isRuntimeDiagnosticsEnabled()) return

  console.log(str, ...args)
  void debugLogger.log(str, ...args)
}
  
export const WARN = (str: string, ...args: any[]) => {
  if (!isRuntimeDiagnosticsEnabled()) return

  console.warn(str, ...args)
  void debugLogger.warn(str, ...args)
}

export const ERROR = (str: string, ...args: any[]) => {
  if (!isRuntimeDiagnosticsEnabled()) return

  console.error(str, ...args)
  void debugLogger.error(str, ...args)
}
