export interface BlockTimeConfig {
  blockNumber: number;
  startTime: string;   // formato 'HH:mm'
  endTime: string;     // formato 'HH:mm'
  isActive?: boolean;
}

export interface BlockTimeConfigResponse {
  grade: string;
  section: string;
  blocks: BlockTimeConfig[];
}

export interface AllBlockTimeConfigsResponse {
  grade: string;
  section: string;
  blocks: BlockTimeConfig[];
}

export interface TypeApiResponseGeneric {
  result: boolean;
  content: any;
  error: string[];
}