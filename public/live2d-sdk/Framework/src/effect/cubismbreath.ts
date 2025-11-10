/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismIdHandle } from '../id/cubismid';
import { CubismFramework } from '../live2dcubismframework';
import { CubismModel } from '../model/cubismmodel';
import { csmVector } from '../type/csmvector';

/**
 * 呼吸機能
 *
 * 呼吸機能を提供する。
 */
export class CubismBreath {
  /**
   * インスタンスの作成
   */
  public static create(): CubismBreath {
    return new CubismBreath();
  }

  /**
   * インスタンスの破棄
   * @param _instance 対象のCubismBreath
   *
   * 備考:
   *  - TS では引数に null を再代入できないため、ここでは no-op にする。
   *  - 必要なら呼び出し側で参照を undefined/null にすること。
   */
  public static delete(_instance: CubismBreath | null | undefined): void {
    // no-op for GC languages; caller can drop the reference.
  }

  /**
   * 呼吸のパラメータの紐づけ
   * @param breathParameters 呼吸を紐づけたいパラメータのリスト
   */
  public setParameters(breathParameters: csmVector<BreathParameterData>): void {
    this._breathParameters = breathParameters;
  }

  /**
   * 呼吸に紐づいているパラメータの取得
   * @return 呼吸に紐づいているパラメータのリスト
   */
  public getParameters(): csmVector<BreathParameterData> {
    return this._breathParameters;
  }

  /**
   * モデルのパラメータの更新
   * @param model 対象のモデル
   * @param deltaTimeSeconds デルタ時間[秒]
   */
  public updateParameters(model: CubismModel, deltaTimeSeconds: number): void {
    this._currentTime += deltaTimeSeconds;

    const t: number = this._currentTime * 2.0 * Math.PI;

    // guard: まだ setParameters されていない場合でも安全に動作
    const params = this._breathParameters;
    const size = params.getSize();

    for (let i = 0; i < size; ++i) {
      const data: BreathParameterData = params.at(i);
      // parameterId は常に non-null（ctor で空IDにフォールバック）
      model.addParameterValueById(
        data.parameterId,
        data.offset + data.peak * Math.sin(t / Math.max(data.cycle, 1e-6)),
        data.weight
      );
    }
  }

  /** コンストラクタ */
  public constructor() {
    this._currentTime = 0.0;
    // デフォルトで空のベクタを持っておく（null/undefined を避ける）
    this._breathParameters = new csmVector<BreathParameterData>();
  }

  private _breathParameters: csmVector<BreathParameterData>; // 呼吸にひもづいているパラメータのリスト
  private _currentTime: number; // 積算時間[秒]
}

/**
 * 呼吸のパラメータ情報
 */
export class BreathParameterData {
  /**
   * コンストラクタ
   * @param parameterId   呼吸をひもづけるパラメータID
   * @param offset        呼吸を正弦波としたときの、波のオフセット
   * @param peak          呼吸を正弦波としたときの、波の高さ
   * @param cycle         呼吸を正弦波としたときの、波の周期
   * @param weight        パラメータへの重み
   */
  constructor(
    parameterId?: CubismIdHandle,
    offset?: number,
    peak?: number,
    cycle?: number,
    weight?: number
  ) {
    // TS strict: parameterId は non-nullable。未指定時は空IDへフォールバック。
    this.parameterId =
      parameterId ??
      CubismFramework.getIdManager().getId(''); // safe empty id

    this.offset = offset ?? 0.0;
    this.peak = peak ?? 0.0;
    this.cycle = cycle ?? 4.0; // 既定周期を 4 秒程度に
    this.weight = weight ?? 1.0;
  }

  public parameterId: CubismIdHandle; // 呼吸をひもづけるパラメータID
  public offset: number; // 呼吸を正弦波としたときの、波のオフセット
  public peak: number; // 呼吸を正弦波としたときの、波の高さ
  public cycle: number; // 呼吸を正弦波としたときの、波の周期
  public weight: number; // パラメータへの重み
}

// Namespace definition for compatibility.
import * as $ from './cubismbreath';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Live2DCubismFramework {
  export const BreathParameterData = $.BreathParameterData;
  export type BreathParameterData = $.BreathParameterData;
  export const CubismBreath = $.CubismBreath;
  export type CubismBreath = $.CubismBreath;
}
