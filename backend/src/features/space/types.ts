export type SpaceDTO = {
  id: string;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSpaceInput = {
  name: string;
  capacity: number;
};

export type UpdateSpaceInput = {
  name?: string;
  capacity?: number;
};
