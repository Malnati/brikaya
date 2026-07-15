import * as debugLogger from '../storage/debugLogger'
import { BUILD_VERSION_LABEL } from '../constants/buildVersion'
import { isRuntimeDiagnosticsEnabled } from './runtimeDiagnostics'

function withBuildVersionPrefix(message: string): string {
  return `[${BUILD_VERSION_LABEL}] ${message}`
}

export const LOG = (str: string, ...args: any[]) => {
  if (!isRuntimeDiagnosticsEnabled()) return

  const message = withBuildVersionPrefix(str)
  console.log(message, ...args)
  void debugLogger.log(message, ...args)
}
  
export const WARN = (str: string, ...args: any[]) => {
  if (!isRuntimeDiagnosticsEnabled()) return

  const message = withBuildVersionPrefix(str)
  console.warn(message, ...args)
  void debugLogger.warn(message, ...args)
}

export const ERROR = (str: string, ...args: any[]) => {
  if (!isRuntimeDiagnosticsEnabled()) return

  const message = withBuildVersionPrefix(str)
  console.error(message, ...args)
  void debugLogger.error(message, ...args)
}
