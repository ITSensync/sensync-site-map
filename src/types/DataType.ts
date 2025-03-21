// src/types/DataType.ts

// Tipe untuk perangkat Sparing
export type SparingDevice = {
  id_device: string;
  last_update: string;
};

// Tipe untuk Base yang belum diperbarui
export type BaseNotUpdated = {
  id: string;
  not_updated: string[];
};

export type BaseUpdated = {
  id: string;
  updated: string[];
};

export type Onlimo = {
  
}

// Tipe utama untuk data Base
export type BaseData = {
  updated: BaseUpdated[];
  not_updated: BaseNotUpdated[];
};

// Tipe utama yang mencakup `sparing` dan `base`
export type DeviceData = {
  sparing: SparingDevice[];
  base: BaseData;
};
