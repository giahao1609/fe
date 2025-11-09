declare module "pixi-live2d-display/cubism4" {
  import * as PIXI from "pixi.js";

  export class Live2DModel extends PIXI.Container {
    /** Load model từ file JSON hoặc object settings */
    static from(path: string | object): Promise<Live2DModel>;

    /** Đăng ký Ticker của Pixi v6 */
    static registerTicker(ticker: PIXI.Ticker): void;

    /** Model nội bộ (chứa coreModel) */
    internalModel: {
      coreModel?: Live2DCoreModel;
      settings?: {
        /** Expressions khai báo trực tiếp (cũ) */
        Expressions?: { Name: string }[];

        /** Motions */
        Motions?: Record<string, any>;

        /** Toàn bộ FileReferences trong model3.json */
        FileReferences?: {
          Moc?: string;
          Textures?: string[];
          Physics?: string;
          DisplayInfo?: string;
          Expressions?: { Name: string; File: string }[];
          Motions?: Record<string, { File: string }[]>;
        };
      };
    };

    /** Gọi motion theo tên */
    motion(name: string, group?: string): Promise<void>;

    /** Gọi expression theo tên */
    expression(name: string): Promise<void>;

    /** Update frame (khi autoUpdate = false thì gọi thủ công) */
    update(delta: number): void;

    /** Bật/tắt autoUpdate */
    autoUpdate: boolean;
  }

  /** Core model API (Cubism Core) */
  export interface Live2DCoreModel {
    addParameterValueById(
      id: string,
      value: number,
      weight?: number
    ): void;
    setParameterValueById(id: string, value: number): void;
    getParameterValueById(id: string): number;
  }
}
