/**
 * Space 資料類型（對齊 backend SpaceDTO）
 */
export interface Space {
  id: string;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 建立 Space 的輸入資料
 */
export interface CreateSpaceInput {
  name: string;
  capacity: number;
}

/**
 * 更新 Space 的輸入資料
 */
export interface UpdateSpaceInput {
  name?: string;
  capacity?: number;
}
