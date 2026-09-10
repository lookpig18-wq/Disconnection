export type OfficeType = 'PRIMARY' | 'SUB_OFFICE';

export interface Office {
  id: string;
  code: string;
  name: string;
  type: OfficeType; // PRIMARY = ไฟฟ้าต้นสังกัด, SUB_OFFICE = ไฟฟ้าในสังกัด
  parentId?: string; // ถ้าเป็นในสังกัด จะอ้างอิงต้นสังกัด
  address?: string;
  phone?: string;
  managerName?: string;
}

export interface Contractor {
  id: string;
  code: string; // 1. รหัสผู้รับจ้าง เช่น CTR-6701, 88201
  name: string; // 1. ชื่อผู้รับจ้าง
  phone: string;
  officeId: string; // สังกัดการไฟฟ้าใด
  status: 'ACTIVE' | 'INACTIVE' | 'LEAVE';
  assignedDeviceCode?: string; // เครื่องที่ถือประจำ
  notes?: string;
}

export interface Device {
  id: string;
  code: string; // 2. รหัสเครื่อง เช่น POS-01, HHT-102
  name: string; // 2. ชื่อรุ่น/ประเภทเครื่อง
  serialNumber?: string;
  officeId: string;
  currentContractorId?: string; // 2. (ชื่อผู้รับจ้างเครื่องนั้นๆ)
  currentContractorName?: string; // ชื่อผู้รับจ้างที่ถือเครื่อง
  status: 'ACTIVE' | 'MAINTENANCE' | 'SPARE';
  lastInspected?: string;
}

export interface Portion {
  id: string;
  officeId: string; // ต้นสังกัด หรือ ในสังกัด
  portionNumber: string; // หมายเลขพอตชั่น เช่น 01, 02, 03
  name: string; // ชื่อโซน/เขตพอตชั่น
  readingDay: number; // 3. วันที่จดหน่วยประจำแต่ละพอตชั่น (1-31)
  routes: string[]; // 4. สายของแต่ละพอตชั่น เช่น ["สาย 01-ตลาดใต้", "สาย 02-ถนนเพชรเกษม", "สาย 03-ซอยร่วมมิตร"]
  defaultContractorId?: string; // ผู้รับจ้างประจำ
  defaultDeviceId?: string; // เครื่องประจำ
  estimatedMeters?: number; // จำนวนมิเตอร์ประมาณการ
}

export type PlanStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
export type PlanPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export interface DisconnectionPlan {
  id: string;
  planCode: string; // รหัสใบสั่งงาน/แผนงาน เช่น CUT-6709-001
  officeId: string; // ไฟฟ้าต้นสังกัด / ในสังกัด
  
  // 3. วันที่จดหน่วยแต่ละพอตชั่น & ข้อมูลพอตชั่น
  portionId: string;
  portionNumber: string; // พอตชั่น เช่น 01
  readingDate: string; // วันที่จดหน่วย (YYYY-MM-DD)
  
  // 4. สายของแต่ละพอตชั่น
  route: string; // สายที่กำหนดงดจ่ายไฟ เช่น สาย 01-ตลาดใต้
  
  // 1. ชื่อและรหัสผู้รับจ้าง
  contractorId: string;
  contractorCode: string; // รหัสผู้รับจ้าง
  contractorName: string; // ชื่อผู้รับจ้าง
  
  // 2. เครื่อง (ชื่อผู้รับจ้างเครื่องนั้นๆ)
  deviceId: string;
  deviceCode: string; // รหัสเครื่อง
  deviceContractorName: string; // ชื่อผู้รับจ้างเครื่องนั้นๆ
  
  // ข้อมูลการปฏิบัติงานงดจ่ายไฟ
  disconnectionDate: string; // วันที่ลงพื้นที่งดจ่ายไฟ (YYYY-MM-DD)
  targetMetersCount: number; // จำนวนรายงดจ่ายไฟ (ราย)
  disconnectedCount: number; // จำนวนที่งดจ่ายไฟแล้ว (ราย)
  paidBeforeCutCount: number; // จำนวนที่ชำระเงินก่อนตัด (ราย)
  postponedCount: number; // จำนวนที่ผ่อนผัน/เลื่อน (ราย)
  
  status: PlanStatus;
  priority: PlanPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  officeId: string; // 'ALL' หรือ ID ของสำนักงาน
  officeType: 'ALL' | 'PRIMARY' | 'SUB_OFFICE';
  portionNumber: string;
  contractorId: string;
  route: string;
  status: string;
  searchQuery: string;
  startDate: string;
  endDate: string;
}
