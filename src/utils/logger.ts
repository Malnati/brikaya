import * as debugLogger from '../storage/debugLogger'

export const LOG = (str: string, ...args: any[]) => {
    console.log(str, ...args)
    debugLogger.log(str, ...args)
  }
  
  export const WARN = (str: string, ...args: any[]) => {
    console.warn(str, ...args)
    debugLogger.warn(str, ...args)
  }
  
  export const ERROR = (str: string, ...args: any[]) => {
    console.error(str, ...args)
    debugLogger.error(str, ...args)
  }