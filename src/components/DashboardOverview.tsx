import React from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Smartphone, 
  Layers, 
  Building2,
  TrendingUp,
  ZapOff
} from 'lucide-react';
import { DisconnectionPlan, Office, Contractor, Device, Portion } from '../types';

interface DashboardOverviewProps {
  plans: DisconnectionPlan[];
  offices: Office[];
  contractors: Contractor[];
  devices: Device[];
  portions: Portion[];
  selectedOfficeId: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  plans,
  offices,
  contractors,
  devices,
  portions,
  selectedOfficeId,
}) => {
  // Filter items according to active office
  const filteredPlans = selectedOfficeId === 'ALL'
    ? plans
    : plans.filter((p) => p.officeId === selectedOfficeId);

  const filteredContractors = selectedOfficeId === 'ALL'
    ? contractors
    : contractors.filter((c) => c.officeId === selectedOfficeId);

  const filteredDevices = selectedOfficeId === 'ALL'
    ? devices
    : devices.filter((d) => d.officeId === selectedOfficeId);

  const filteredPortions = selectedOfficeId === 'ALL'
    ? portions
    : portions.filter((p) => p.officeId === selectedOfficeId);

  const totalTargetMeters = filteredPlans.reduce((acc, p) => acc + (p.targetMetersCount || 0), 0);
  const totalDisconnected = filteredPlans.reduce((acc, p) => acc + (p.disconnectedCount || 0), 0);
  const totalPaidBeforeCut = filteredPlans.reduce((acc, p) => acc + (p.paidBeforeCutCount || 0), 0);

  const inProgressCount = filteredPlans.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedCount = filteredPlans.filter((p) => p.status === 'COMPLETED').length;
  const plannedCount = filteredPlans.filter((p) => p.status === 'PLANNED' || p.status === 'DRAFT').length;

  const totalRoutesCount = filteredPortions.reduce((acc, p) => acc + (p.routes ? p.routes.length : 0), 0);

  const completionRate = totalTargetMeters > 0 
    ? Math.round(((totalDisconnected + totalPaidBeforeCut) / totalTargetMeters) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {/* Metric 1: Total Plans */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">แผนงานทั้งหมด</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-slate-900">{filteredPlans.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="text-amber-600 font-semibold">{inProgressCount} ทำอยู่</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">{completedCount} เสร็จ</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Target Meters vs Cut */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">ยอดเป้าหมายตัดไฟ</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <ZapOff className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-slate-900">{totalTargetMeters.toLocaleString()} <span className="text-xs font-normal text-slate-500">ราย</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ตัดแล้ว <span className="text-rose-600 font-semibold">{totalDisconnected}</span> | ชำระ <span className="text-emerald-600 font-semibold">{totalPaidBeforeCut}</span>
          </div>
        </div>
      </div>

      {/* Metric 3: Completion Progress */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">อัตราความสำเร็จ</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-emerald-700">{completionRate}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, completionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric 4: Contractors (1. ชื่อและรหัสผู้รับจ้าง) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">1. ผู้รับจ้าง</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-slate-900">{filteredContractors.length} <span className="text-xs font-normal text-slate-500">ราย</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            พร้อมปฏิบัติงาน {filteredContractors.filter(c => c.status === 'ACTIVE').length} ราย
          </div>
        </div>
      </div>

      {/* Metric 5: Devices (2. เครื่อง) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">2. เครื่องประจำการ</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-slate-900">{filteredDevices.length} <span className="text-xs font-normal text-slate-500">เครื่อง</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            มีผู้ถือเครื่อง {filteredDevices.filter(d => d.currentContractorId).length} เครื่อง
          </div>
        </div>
      </div>

      {/* Metric 6: Portions & Routes (3 & 4) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">3.พอตชั่น / 4.สาย</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-slate-900">{filteredPortions.length} <span className="text-xs font-normal text-slate-500">พอตชั่น</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            รวม {totalRoutesCount} สายปฏิบัติงาน
          </div>
        </div>
      </div>
    </div>
  );
};
