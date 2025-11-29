/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { ICubismModelSetting } from '../icubismmodelsetting';
import { CubismIdHandle } from '../id/cubismid';
import { CubismModel } from '../model/cubismmodel';
import { csmVector } from '../type/csmvector';

/**
 * 自動まばたき機能
 *
 * 自動まばたき機能を提供する。
 */
export class CubismEyeBlink {
  /**
   * インスタンスを作成する
   * @param modelSetting モデルの設定情報（省略可）
   * @return 作成されたインスタンス
   * @note 引数未指定の場合、パラメータIDが空のインスタンスを作成する。
   */
  public static create(modelSetting?: ICubismModelSetting): CubismEyeBlink {
    return new CubismEyeBlink(modelSetting);
  }

  /**
   * インスタンスの破棄
   * @param _eyeBlink 対象のCubismEyeBlink
   *
   * 備考: TypeScript では参照に null を再代入できないため no-op。
   *       呼び出し側で参照を破棄すれば GC が回収する。
   */
  public static delete(_eyeBlink?: CubismEyeBlink | null): void {
    // no-op
  }

  /** まばたきの間隔の設定（秒） */
  public setBlinkingInterval(blinkingInterval: number): void {
    this._blinkingIntervalSeconds = blinkingInterval;
  }

  /** まばたきモーションの詳細設定（秒） */
  public setBlinkingSetting(closing: number, closed: number, opening: number): void {
    this._closingSeconds = closing;
    this._closedSeconds = closed;
    this._openingSeconds = opening;
  }

  /** まばたきさせるパラメータIDのリストの設定 */
  public setParameterIds(parameterIds: csmVector<CubismIdHandle>): void {
    this._parameterIds = parameterIds;
  }

  /** まばたきさせるパラメータIDのリストの取得 */
  public getParameterIds(): csmVector<CubismIdHandle> {
    return this._parameterIds;
  }

  /**
   * モデルのパラメータの更新
   * @param model 対象のモデル
   * @param deltaTimeSeconds デルタ時間[秒]
   */
  public updateParameters(model: CubismModel, deltaTimeSeconds: number): void {
    this._userTimeSeconds += deltaTimeSeconds;

    let parameterValue = 1.0;
    let t = 0.0;

    switch (this._blinkingState) {
      case EyeState.EyeState_Closing: {
        t = (this._userTimeSeconds - this._stateStartTimeSeconds) / this._closingSeconds;
        if (t >= 1.0) {
          t = 1.0;
          this._blinkingState = EyeState.EyeState_Closed;
          this._stateStartTimeSeconds = this._userTimeSeconds;
        }
        parameterValue = 1.0 - t;
        break;
      }

      case EyeState.EyeState_Closed: {
        t = (this._userTimeSeconds - this._stateStartTimeSeconds) / this._closedSeconds;
        if (t >= 1.0) {
          this._blinkingState = EyeState.EyeState_Opening;
          this._stateStartTimeSeconds = this._userTimeSeconds;
        }
        parameterValue = 0.0;
        break;
      }

      case EyeState.EyeState_Opening: {
        t = (this._userTimeSeconds - this._stateStartTimeSeconds) / this._openingSeconds;
        if (t >= 1.0) {
          t = 1.0;
          this._blinkingState = EyeState.EyeState_Interval;
          this._nextBlinkingTime = this.determinNextBlinkingTiming();
        }
        parameterValue = t;
        break;
      }

      case EyeState.EyeState_Interval: {
        if (this._nextBlinkingTime < this._userTimeSeconds) {
          this._blinkingState = EyeState.EyeState_Closing;
          this._stateStartTimeSeconds = this._userTimeSeconds;
        }
        parameterValue = 1.0;
        break;
      }

      case EyeState.EyeState_First:
      default: {
        this._blinkingState = EyeState.EyeState_Interval;
        this._nextBlinkingTime = this.determinNextBlinkingTiming();
        parameterValue = 1.0;
        break;
      }
    }

    if (!CubismEyeBlink.CloseIfZero) {
      parameterValue = -parameterValue;
    }

    const size = this._parameterIds.getSize();
    for (let i = 0; i < size; ++i) {
      model.setParameterValueById(this._parameterIds.at(i), parameterValue);
    }
  }

  /** コンストラクタ */
  public constructor(modelSetting?: ICubismModelSetting) {
    this._blinkingState = EyeState.EyeState_First;
    this._nextBlinkingTime = 0.0;
    this._stateStartTimeSeconds = 0.0;
    this._blinkingIntervalSeconds = 4.0;
    this._closingSeconds = 0.1;
    this._closedSeconds = 0.05;
    this._openingSeconds = 0.15;
    this._userTimeSeconds = 0.0;
    this._parameterIds = new csmVector<CubismIdHandle>();

    // modelSetting が渡された場合のみ ID を収集
    if (modelSetting) {
      const count = modelSetting.getEyeBlinkParameterCount();
      for (let i = 0; i < count; ++i) {
        // インターフェース準拠: 戻り値は CubismIdHandle（null にはしない）
        const id = modelSetting.getEyeBlinkParameterId(i);
        this._parameterIds.pushBack(id);
      }
    }
  }

  /** 次の瞬きのタイミングの決定 */
  public determinNextBlinkingTiming(): number {
    const r: number = Math.random();
    return this._userTimeSeconds + r * (2.0 * this._blinkingIntervalSeconds - 1.0);
  }

  private _blinkingState: EyeState;                 // 現在の状態
  private _parameterIds: csmVector<CubismIdHandle>; // 操作対象のパラメータのIDのリスト
  private _nextBlinkingTime: number;                // 次のまばたきの時刻[秒]
  private _stateStartTimeSeconds: number;           // 現在の状態が開始した時刻[秒]
  private _blinkingIntervalSeconds: number;         // まばたきの間隔[秒]
  private _closingSeconds: number;                  // まぶたを閉じる時間[秒]
  private _closedSeconds: number;                   // まぶたを閉じたままの時間[秒]
  private _openingSeconds: number;                  // まぶたを開く時間[秒]
  private _userTimeSeconds: number;                 // デルタ時間の積算値[秒]

  /**
   * IDで指定された目のパラメータが、0のときに閉じるなら true 、1の時に閉じるなら false 。
   */
  static readonly CloseIfZero: boolean = true;
}

/** まばたきの状態 */
export enum EyeState {
  EyeState_First = 0,
  EyeState_Interval,
  EyeState_Closing,
  EyeState_Closed,
  EyeState_Opening
}

// Namespace definition for compatibility.
import * as $ from './cubismeyeblink';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Live2DCubismFramework {
  export const CubismEyeBlink = $.CubismEyeBlink;
  export type CubismEyeBlink = $.CubismEyeBlink;
  export const EyeState = $.EyeState;
  export type EyeState = $.EyeState;
}
