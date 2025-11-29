/**
 * Copyright(c) Live2D Inc. All rights ...
 */

import { ICubismModelSetting } from './icubismmodelsetting';
import { CubismIdHandle } from './id/cubismid';
import { CubismFramework } from './live2dcubismframework';
import { csmMap, iterator } from './type/csmmap';
import { csmVector } from './type/csmvector';
import { CubismJson, Value } from './utils/cubismjson';

export enum FrequestNode {
  FrequestNode_Groups,
  FrequestNode_Moc,
  FrequestNode_Motions,
  FrequestNode_Expressions,
  FrequestNode_Textures,
  FrequestNode_Physics,
  FrequestNode_Pose,
  FrequestNode_HitAreas,
}

/**
 * Model3Json パーサー
 */
export class CubismModelSettingJson extends ICubismModelSetting {
  public constructor(buffer: ArrayBuffer, size: number) {
    super();

    // Guard null: CubismJson.create can return null
    const created = CubismJson.create(buffer, size);
    if (!created) {
      throw new Error('CubismModelSettingJson: failed to parse model3.json');
    }

    this._json = created;
    this._jsonValue = new csmVector<Value>();

    // 順番は enum FrequestNode と一致
    const root = this._json.getRoot();

    this._jsonValue.pushBack(root.getValueByString(this.groups));

    const fr = root.getValueByString(this.fileReferences);
    this._jsonValue.pushBack(fr.getValueByString(this.moc));
    this._jsonValue.pushBack(fr.getValueByString(this.motions));
    this._jsonValue.pushBack(fr.getValueByString(this.expressions));
    this._jsonValue.pushBack(fr.getValueByString(this.textures));
    this._jsonValue.pushBack(fr.getValueByString(this.physics));
    this._jsonValue.pushBack(fr.getValueByString(this.pose));

    this._jsonValue.pushBack(root.getValueByString(this.hitAreas));
  }

  /** デストラクタ相当の処理 */
  public release(): void {
    CubismJson.delete(this._json);
    // _jsonValue không cần gán null (tránh union type không cần thiết)
  }

  /** CubismJsonオブジェクトを取得する */
  public getJson(): CubismJson {
    // Đảm bảo không null vì đã guard trong constructor
    return this._json;
  }

  /** Mocファイルの名前を取得する */
  public getModelFileName(): string {
    if (!this.isExistModelFile()) return '';
    return this._jsonValue.at(FrequestNode.FrequestNode_Moc).getRawString();
  }

  /** 使用するテクスチャ数 */
  public getTextureCount(): number {
    if (!this.isExistTextureFiles()) return 0;
    return this._jsonValue.at(FrequestNode.FrequestNode_Textures).getSize();
  }

  /** テクスチャディレクトリ名 */
  public getTextureDirectory(): string {
    const texturePath = this._jsonValue
      .at(FrequestNode.FrequestNode_Textures)
      .getValueByIndex(0)
      .getRawString();

    const pathArray = texturePath.split('/');
    const arrayLength = pathArray.length - 1;
    let out = '';
    for (let i = 0; i < arrayLength; i++) {
      out += pathArray[i];
      if (i < arrayLength - 1) out += '/';
    }
    return out;
  }

  /** テクスチャファイル名 */
  public getTextureFileName(index: number): string {
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Textures)
      .getValueByIndex(index)
      .getRawString();
  }

  /** 当たり判定の数 */
  public getHitAreasCount(): number {
    if (!this.isExistHitAreas()) return 0;
    return this._jsonValue.at(FrequestNode.FrequestNode_HitAreas).getSize();
  }

  /** 当たり判定のID */
  public getHitAreaId(index: number): CubismIdHandle {
    return CubismFramework.getIdManager().getId(
      this._jsonValue
        .at(FrequestNode.FrequestNode_HitAreas)
        .getValueByIndex(index)
        .getValueByString(this.id)
        .getRawString()
    );
  }

  /** 当たり判定の名前 */
  public getHitAreaName(index: number): string {
    return this._jsonValue
      .at(FrequestNode.FrequestNode_HitAreas)
      .getValueByIndex(index)
      .getValueByString(this.name)
      .getRawString();
  }

  /** 物理演算設定ファイル名 */
  public getPhysicsFileName(): string {
    if (!this.isExistPhysicsFile()) return '';
    return this._jsonValue.at(FrequestNode.FrequestNode_Physics).getRawString();
  }

  /** ポーズ設定ファイル名 */
  public getPoseFileName(): string {
    if (!this.isExistPoseFile()) return '';
    return this._jsonValue.at(FrequestNode.FrequestNode_Pose).getRawString();
  }

  /** 表情設定ファイル数 */
  public getExpressionCount(): number {
    if (!this.isExistExpressionFile()) return 0;
    return this._jsonValue.at(FrequestNode.FrequestNode_Expressions).getSize();
  }

  /** 表情の別名(表示名) */
  public getExpressionName(index: number): string {
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Expressions)
      .getValueByIndex(index)
      .getValueByString(this.name)
      .getRawString();
  }

  /** 表情設定ファイル名 */
  public getExpressionFileName(index: number): string {
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Expressions)
      .getValueByIndex(index)
      .getValueByString(this.filePath)
      .getRawString();
  }

  /** モーショングループ数 */
  public getMotionGroupCount(): number {
    if (!this.isExistMotionGroups()) return 0;
    return this._jsonValue.at(FrequestNode.FrequestNode_Motions).getKeys().getSize();
  }

  /** モーショングループ名 */
   public getMotionGroupName(index: number): string {
    if (!this.isExistMotionGroups()) return '';
    return (
      this._jsonValue
        .at(FrequestNode.FrequestNode_Motions)
        .getKeys()
        .at(index) ?? ''
    );
  }

  /** 指定グループ内のモーション数 */
  public getMotionCount(groupName: string): number {
    if (!this.isExistMotionGroupName(groupName)) return 0;
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getSize();
  }

  /** モーションファイル名 */
  public getMotionFileName(groupName: string, index: number): string {
    if (!this.isExistMotionGroupName(groupName)) return '';
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getValueByIndex(index)
      .getValueByString(this.filePath)
      .getRawString();
  }

  /** モーションのサウンドファイル名 */
  public getMotionSoundFileName(groupName: string, index: number): string {
    if (!this.isExistMotionSoundFile(groupName, index)) return '';
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getValueByIndex(index)
      .getValueByString(this.soundPath)
      .getRawString();
  }

  /** フェードイン時間(秒) */
  public getMotionFadeInTimeValue(groupName: string, index: number): number {
    if (!this.isExistMotionFadeIn(groupName, index)) return -1.0;
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getValueByIndex(index)
      .getValueByString(this.fadeInTime)
      .toFloat();
  }

  /** フェードアウト時間(秒) */
  public getMotionFadeOutTimeValue(groupName: string, index: number): number {
    if (!this.isExistMotionFadeOut(groupName, index)) return -1.0;
    return this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getValueByIndex(index)
      .getValueByString(this.fadeOutTime)
      .toFloat();
  }

  /** ユーザーデータファイル名 */
  public getUserDataFile(): string {
    if (!this.isExistUserDataFile()) return '';
    return this._json
      .getRoot()
      .getValueByString(this.fileReferences)
      .getValueByString(this.userData)
      .getRawString();
  }

  /** レイアウト情報取得 */
  public getLayoutMap(outLayoutMap: csmMap<string, number>): boolean {
    const map: csmMap<string, Value> = this._json
      .getRoot()
      .getValueByString(this.layout)
      .getMap();

    if (map == null) return false;

    let ret = false;
    for (
      const ite: iterator<string, Value> = map.begin();
      ite.notEqual(map.end());
      ite.preIncrement()
    ) {
      outLayoutMap.setValue(ite.ptr().first, ite.ptr().second.toFloat());
      ret = true;
    }
    return ret;
  }

  /** 目パチ関連パラメータ数 */
  public getEyeBlinkParameterCount(): number {
    if (!this.isExistEyeBlinkParameters()) return 0;

    for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
      const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
      if (refI.isNull() || refI.isError()) continue;
      if (refI.getValueByString(this.name).getRawString() === this.eyeBlink) {
        return refI.getValueByString(this.ids).getVector().getSize();
      }
    }
    return 0;
  }

  /** 目パチ関連パラメータID */
  /** 目パチ関連パラメータID */
public getEyeBlinkParameterId(index: number): CubismIdHandle {
  if (!this.isExistEyeBlinkParameters()) {
    // trả về ID rỗng để thỏa interface
    return CubismFramework.getIdManager().getId('');
  }

  for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
    const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
    if (refI.isNull() || refI.isError()) continue;

    if (refI.getValueByString(this.name).getRawString() === this.eyeBlink) {
      const raw =
        refI.getValueByString(this.ids).getValueByIndex(index)?.getRawString?.() ?? '';
      return CubismFramework.getIdManager().getId(raw);
    }
  }

  return CubismFramework.getIdManager().getId('');
}


  /** リップシンク関連パラメータ数 */
  public getLipSyncParameterCount(): number {
    if (!this.isExistLipSyncParameters()) return 0;
    for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
      const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
      if (refI.isNull() || refI.isError()) continue;
      if (refI.getValueByString(this.name).getRawString() === this.lipSync) {
        return refI.getValueByString(this.ids).getVector().getSize();
      }
    }
    return 0;
  }

  /** リップシンク関連パラメータID */
public getLipSyncParameterId(index: number): CubismIdHandle {
  if (!this.isExistLipSyncParameters()) {
    return CubismFramework.getIdManager().getId('');
  }

  for (let i = 0; i < this._jsonValue.at(FrequestNode.FrequestNode_Groups).getSize(); i++) {
    const refI: Value = this._jsonValue.at(FrequestNode.FrequestNode_Groups).getValueByIndex(i);
    if (refI.isNull() || refI.isError()) continue;

    if (refI.getValueByString(this.name).getRawString() === this.lipSync) {
      const raw =
        refI.getValueByString(this.ids).getValueByIndex(index)?.getRawString?.() ?? '';
      return CubismFramework.getIdManager().getId(raw);
    }
  }

  return CubismFramework.getIdManager().getId('');
}


  // ===== Existence checks =====
  protected isExistModelFile(): boolean {
    const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Moc);
    return !node.isNull() && !node.isError();
  }

  protected isExistTextureFiles(): boolean {
    const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Textures);
    return !node.isNull() && !node.isError();
  }

  protected isExistHitAreas(): boolean {
    const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_HitAreas);
    return !node.isNull() && !node.isError();
  }

  protected isExistPhysicsFile(): boolean {
    const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Physics);
    return !node.isNull() && !node.isError();
  }

  protected isExistPoseFile(): boolean {
    const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Pose);
    return !node.isNull() && !node.isError();
  }

  protected isExistExpressionFile(): boolean {
    const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Expressions);
    return !node.isNull() && !node.isError();
  }

  protected isExistMotionGroups(): boolean {
    const node: Value = this._jsonValue.at(FrequestNode.FrequestNode_Motions);
    return !node.isNull() && !node.isError();
  }

  protected isExistMotionGroupName(groupName: string): boolean {
    const node: Value = this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName);
    return !node.isNull() && !node.isError();
  }

  protected isExistMotionSoundFile(groupName: string, index: number): boolean {
    const node: Value = this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getValueByIndex(index)
      .getValueByString(this.soundPath);
    return !node.isNull() && !node.isError();
  }

  protected isExistMotionFadeIn(groupName: string, index: number): boolean {
    const node: Value = this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getValueByIndex(index)
      .getValueByString(this.fadeInTime);
    return !node.isNull() && !node.isError();
  }

  protected isExistMotionFadeOut(groupName: string, index: number): boolean {
    const node: Value = this._jsonValue
      .at(FrequestNode.FrequestNode_Motions)
      .getValueByString(groupName)
      .getValueByIndex(index)
      .getValueByString(this.fadeOutTime);
    return !node.isNull() && !node.isError();
  }

  protected isExistUserDataFile(): boolean {
    const node: Value = this._json
      .getRoot()
      .getValueByString(this.fileReferences)
      .getValueByString(this.userData);
    return !node.isNull() && !node.isError();
  }

  protected isExistEyeBlinkParameters(): boolean {
    const groups = this._jsonValue.at(FrequestNode.FrequestNode_Groups);
    if (groups.isNull() || groups.isError()) return false;

    for (let i = 0; i < groups.getSize(); ++i) {
      const g = groups.getValueByIndex(i);
      if (g.isNull() || g.isError()) continue;
      if (g.getValueByString(this.name).getRawString() === this.eyeBlink) {
        return true;
      }
    }
    return false;
  }

  protected isExistLipSyncParameters(): boolean {
    const groups = this._jsonValue.at(FrequestNode.FrequestNode_Groups);
    if (groups.isNull() || groups.isError()) return false;

    for (let i = 0; i < groups.getSize(); ++i) {
      const g = groups.getValueByIndex(i);
      if (g.isNull() || g.isError()) continue;
      if (g.getValueByString(this.name).getRawString() === this.lipSync) {
        return true;
      }
    }
    return false;
  }

  // ===== Fields =====
  protected _json!: CubismJson;
  protected _jsonValue!: csmVector<Value>;

  protected readonly version = 'Version';
  protected readonly fileReferences = 'FileReferences';

  protected readonly groups = 'Groups';
  protected readonly layout = 'Layout';
  protected readonly hitAreas = 'HitAreas';

  protected readonly moc = 'Moc';
  protected readonly textures = 'Textures';
  protected readonly physics = 'Physics';
  protected readonly pose = 'Pose';
  protected readonly expressions = 'Expressions';
  protected readonly motions = 'Motions';

  protected readonly userData = 'UserData';
  protected readonly name = 'Name';
  protected readonly filePath = 'File';
  protected readonly id = 'Id';
  protected readonly ids = 'Ids';
  protected readonly target = 'Target';

  // Motions
  protected readonly idle = 'Idle';
  protected readonly tapBody = 'TapBody';
  protected readonly pinchIn = 'PinchIn';
  protected readonly pinchOut = 'PinchOut';
  protected readonly shake = 'Shake';
  protected readonly flickHead = 'FlickHead';
  protected readonly parameter = 'Parameter';

  protected readonly soundPath = 'Sound';
  protected readonly fadeInTime = 'FadeInTime';
  protected readonly fadeOutTime = 'FadeOutTime';

  // Layout
  protected readonly centerX = 'CenterX';
  protected readonly centerY = 'CenterY';
  protected readonly x = 'X';
  protected readonly y = 'Y';
  protected readonly width = 'Width';
  protected readonly height = 'Height';

  protected readonly lipSync = 'LipSync';
  protected readonly eyeBlink = 'EyeBlink';

  protected readonly initParameter = 'init_param';
  protected readonly initPartsVisible = 'init_parts_visible';
  protected readonly val = 'val';
}

// Namespace definition for compatibility.
import * as $ from './cubismmodelsettingjson';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Live2DCubismFramework {
  export const CubismModelSettingJson = $.CubismModelSettingJson;
  export type CubismModelSettingJson = $.CubismModelSettingJson;
  export const FrequestNode = $.FrequestNode;
  export type FrequestNode = $.FrequestNode;
}
