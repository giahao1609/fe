import { csmString } from '../type/csmstring';
import { csmVector } from '../type/csmvector';
import { CubismId } from './cubismid';

/**
 * ID名の管理
 *
 * ID名を管理する。
 */
export class CubismIdManager {
  /** コンストラクタ */
  public constructor() {
    this._ids = new csmVector<CubismId>();
  }

  /** デストラクタ相当の処理 */
  public release(): void {
    // ❌ this._ids.set(i, void 0) は型違反
    // ❌ this._ids = null も型違反
    // ✅ ベクタをリセット（空のインスタンスへ置き換え）
    if (this._ids) {
      // もし csmVector に clear() があれば:
      // (this._ids as any).clear?.();
      // 無い場合は新しいインスタンスを割り当て:
      this._ids = new csmVector<CubismId>();
    }
  }

  /** ID名をリストから登録 */
  public registerIds(ids: Array<string | csmString>): void {
    for (let i = 0; i < ids.length; i++) {
      this.registerId(ids[i]);
    }
  }

  /** ID名を登録 */
  public registerId(id: string | csmString): CubismId {
    // 入力値を string に正規化
    const key = typeof id === 'string' ? id : id.s;

    const existing = this.findId(key);
    if (existing) return existing;

    const created = CubismId.createIdInternal(key);
    this._ids.pushBack(created);
    return created;
  }

  /** ID名からIDを取得する */
  public getId(id: csmString | string): CubismId {
    return this.registerId(id);
  }

  /** ID名からIDの確認 */
  public isExist(id: csmString | string): boolean {
    const key = typeof id === 'string' ? id : id.s;
    return this.findId(key) != null;
  }

  /**
   * ID名からIDを検索する。
   * @return 登録されているID。なければ null。
   */
  private findId(id: string): CubismId | null {
    for (let i = 0; i < this._ids.getSize(); ++i) {
      const item = this._ids.at(i);
      if (item && item.getString().isEqual(id)) {
        return item;
      }
    }
    return null;
  }

  private _ids: csmVector<CubismId>; // 登録されているIDのリスト
}

// Namespace definition for compatibility.
import * as $ from './cubismidmanager';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Live2DCubismFramework {
  export const CubismIdManager = $.CubismIdManager;
  export type CubismIdManager = $.CubismIdManager;
}
