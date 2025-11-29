/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismIdManager } from './id/cubismidmanager';
import { CubismRenderer } from './rendering/cubismrenderer';
import { CSM_ASSERT, CubismLogInfo, CubismLogWarning } from './utils/cubismdebug';
import { Value } from './utils/cubismjson';

export function strtod(s: string, endPtr: string[]): number {
  let index = 0;
  for (let i = 1; ; i++) {
    const testC: string = s.slice(i - 1, i);
    if (testC === 'e' || testC === '-' || testC === 'E') continue;
    const test: string = s.substring(0, i);
    const number = Number(test);
    if (isNaN(number)) break;
    index = i;
  }
  let d = parseFloat(s);
  if (isNaN(d)) d = NaN;
  endPtr[0] = s.slice(index);
  return d;
}

// ===== module-scope state (nullable with strictNullChecks) =====
let s_isStarted = false;
let s_isInitialized = false;
let s_option: Option | null = null;
let s_cubismIdManager: CubismIdManager | null = null;

/** Framework constants */
export const Constant = Object.freeze<Record<string, number>>({
  vertexOffset: 0,
  vertexStep: 2,
});

export function csmDelete<T>(address: T): void {
  if (!address) return;
  // no-op in TS runtime; keep for compatibility
}

/**
 * Live2D Cubism SDK entrypoint
 */
export class CubismFramework {
  /**
   * Enable Cubism Framework API.
   * Call once before other APIs.
   */
  public static startUp(option?: Option): boolean {
    if (s_isStarted) {
      CubismLogInfo('CubismFramework.startUp() is already done.');
      return s_isStarted;
    }

    s_option = option ?? null;

    if (s_option?.logFunction) {
      Live2DCubismCore.Logging.csmSetLogFunction(s_option.logFunction);
    }

    s_isStarted = true;

    // Show Core version
    if (s_isStarted) {
      const version: number = Live2DCubismCore.Version.csmGetVersion();
      const major: number = (version & 0xff000000) >> 24;
      const minor: number = (version & 0x00ff0000) >> 16;
      const patch: number = version & 0x0000ffff;
      const versionNumber: number = version;

      CubismLogInfo(
        `Live2D Cubism Core version: {0}.{1}.{2} ({3})`,
        ('00' + major).slice(-2),
        ('00' + minor).slice(-2),
        ('0000' + patch).slice(-4),
        versionNumber
      );
    }

    CubismLogInfo('CubismFramework.startUp() is complete.');
    return s_isStarted;
  }

  /** Clear flags so the framework can be reused after dispose(). */
  public static cleanUp(): void {
    s_isStarted = false;
    s_isInitialized = false;
    s_option = null;
    s_cubismIdManager = null;
  }

  /**
   * Initialize resources inside the framework.
   * Call dispose() before calling initialize() again.
   */
  public static initialize(memorySize = 0): void {
    CSM_ASSERT(s_isStarted);
    if (!s_isStarted) {
      CubismLogWarning('CubismFramework is not started.');
      return;
    }
    if (s_isInitialized) {
      CubismLogWarning('CubismFramework.initialize() skipped, already initialized.');
      return;
    }

    // static init
    Value.staticInitializeNotForClientCall();

    s_cubismIdManager = new CubismIdManager();

    // memory hint (rounded to at least 16MB inside Core)
    Live2DCubismCore.Memory.initializeAmountOfMemory(memorySize);

    s_isInitialized = true;
    CubismLogInfo('CubismFramework.initialize() is complete.');
  }

  /**
   * Release all resources inside the framework.
   * External resources must be freed externally.
   */
  public static dispose(): void {
    CSM_ASSERT(s_isStarted);
    if (!s_isStarted) {
      CubismLogWarning('CubismFramework is not started.');
      return;
    }
    if (!s_isInitialized) {
      CubismLogWarning('CubismFramework.dispose() skipped, not initialized.');
      return;
    }

    Value.staticReleaseNotForClientCall();

    // release id manager safely under strictNullChecks
    s_cubismIdManager?.release();
    s_cubismIdManager = null;

    // release renderer static resources
    CubismRenderer.staticRelease();

    s_isInitialized = false;
    CubismLogInfo('CubismFramework.dispose() is complete.');
  }

  /** Whether startUp() has been called successfully. */
  public static isStarted(): boolean {
    return s_isStarted;
  }

  /** Whether initialize() has completed. */
  public static isInitialized(): boolean {
    return s_isInitialized;
  }

  /** Bridge to Core’s log function. */
  public static coreLogFunction(message: string): void {
    const fn = Live2DCubismCore.Logging.csmGetLogFunction();
    if (!fn) return;
    fn(message);
  }

  /** Current logging level. */
  public static getLoggingLevel(): LogLevel {
    return s_option?.loggingLevel ?? LogLevel.LogLevel_Off;
  }

  /** Get ID manager (non-null after initialize()) */
  public static getIdManager(): CubismIdManager {
    // If someone calls before initialize, fail loudly for easier debugging.
    if (!s_cubismIdManager) {
      throw new Error('CubismFramework.getIdManager() called before initialize().');
    }
    return s_cubismIdManager;
  }

  /** Prevent instantiation */
  private constructor() {}
}

export class Option {
  logFunction?: Live2DCubismCore.csmLogFunction;
  loggingLevel: LogLevel = LogLevel.LogLevel_Off;
}

export enum LogLevel {
  LogLevel_Verbose = 0,
  LogLevel_Debug,
  LogLevel_Info,
  LogLevel_Warning,
  LogLevel_Error,
  LogLevel_Off,
}

// Namespace definition for compatibility.
import * as $ from './live2dcubismframework';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Live2DCubismFramework {
  export const Constant = $.Constant;
  export const csmDelete = $.csmDelete;
  export const CubismFramework = $.CubismFramework;
  export type CubismFramework = $.CubismFramework;
}
