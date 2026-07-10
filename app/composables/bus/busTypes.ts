/**
 * バス時刻表まわりの共有型
 */

import type { UiCompanyCode } from "./busCompany";

/** 時刻表の各バスエントリ */
export interface TimetableEntry {
  routeId: string;
  routeCode: string;
  routeName: string;
  routeColor?: string;
  textColor: string;
  borderColor: string;
  company: UiCompanyCode;
  destination: string;
  scheduledTime: string;
  estimatedTime: string;
  delay: number;
  scheduledDate: Date;
  estimatedDate: Date;
  isPast: boolean;
  boardingStopName: string;
}

/** マイルートのデータ構造 */
export interface MyRoute {
  id: string;
  boarding: string;
  dropOff: string;
  isPinned: boolean;
  createdAt: number;
}
