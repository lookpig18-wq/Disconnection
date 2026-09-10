import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Zap, 
  ZapOff, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Smartphone, 
  Layers, 
  Building2, 
  Search, 
  Printer, 
  Edit3, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DisconnectionPlan, Office, Contractor, Device, Portion, PlanStatus } from '../types';

interface DailyWorkloadTabProps {
  plans: DisconnectionPlan[];
  offices: Office[];
  contractors: Contractor[];
  devices: Device[];
  portions: Portion[];
  selectedOfficeId: string;
  onOpenNewPlan: () => void;
  onEditPlan: (plan: DisconnectionPlan) => void;
  onUpdatePlanStatus: (id: string, status: PlanStatus) => void;
  onPrintPlan: (plan: DisconnectionPlan) => void;
  onUpdatePlanMetrics: (id: string, metrics: { disconnectedCount?: number; paidBeforeCutCount?: number; postponedCount?: number }) => void;
}

export const DailyWorkloadTab: React.FC<DailyWorkloadTabProps> = ({
  plans,
  offices,
  contractors,
  devices,
  portions,
  selectedOfficeId,
  onOpenNewPlan,
  onEditPlan,
  onUpdatePlanStatus,
  onPrintPlan,
  onUpdatePlanMetrics,
}) => {
  // Default to 2026-09-01 (1 ก.ย. 2569) or current date
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-01');
  const [filterContractorId, setFilterContractorId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Format Thai Date string for display e.g. 1 กันยายน 2569
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10) + 543;
        const monthNames = [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const monthName = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
        const day = parseInt(parts[2], 10);
        return `วันที่ ${day} ${monthName} พ.ศ. ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatShortThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10) + 543;
        const shortMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const m = shortMonths[parseInt(parts[1], 10) - 1] || parts[1];
        return `${parseInt(parts[2], 10)} ${m} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Date navigation helpers
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    if (isNaN(current.getTime())) return;
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // Filter plans for the selected date
  const dailyPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Date match (disconnectionDate)
      if (plan.disconnectionDate !== selectedDate) {
        return false;
      }
      // Office match
      if (selectedOfficeId !== 'ALL' && plan.officeId !== selectedOfficeId) {
        return false;
      }
      // Contractor match
      if (filterContractorId !== 'ALL' && plan.contractorId !== filterContractorId) {
        return false;
      }
      // Status match
      if (filterStatus !== 'ALL' && plan.status !== filterStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = plan.planCode.toLowerCase().includes(q);
        const matchCtr = (plan.contractorName + ' ' + plan.contractorCode).toLowerCase().includes(q);
        const matchDev = (plan.deviceCode + ' ' + plan.deviceContractorName).toLowerCase().includes(q);
        const matchPor = (plan.portionNumber + ' ' + plan.route).toLowerCase().includes(q);
        if (!matchCode && !matchCtr && !matchDev && !matchPor) return false;
      }
      return true;
    });
  }, [plans, selectedDate, selectedOfficeId, filterContractorId, filterStatus, searchQuery]);

  // Aggregated totals for the selected date
  const totalAssignedToday = dailyPlans.reduce((sum, p) => sum + (p.targetMetersCount || 0), 0);
  const totalDisconnectedToday = dailyPlans.reduce((sum, p) => sum + (p.disconnectedCount || 0), 0);
  const totalPaidToday = dailyPlans.reduce((sum, p) => sum + (p.paidBeforeCutCount || 0), 0);
  const totalPostponedToday = dailyPlans.reduce((sum, p) => sum + (p.postponedCount || 0), 0);
  
  // Total Remaining today: Assigned - Disconnected - Paid - Postponed
  const totalRemainingToday = Math.max(0, totalAssignedToday - totalDisconnectedToday - totalPaidToday - totalPostponedToday);
  const totalProcessedToday = totalDisconnectedToday + totalPaidToday + totalPostponedToday;
  const dailyCompletionRate = totalAssignedToday > 0 ? Math.round((totalProcessedToday / totalAssignedToday) * 100) : 0;

  const getOffice = (id: string) => offices.find((o) => o.id === id);

  // Quick increment handlers for technician field updates
  const handleQuickAddDisconnected = (plan: DisconnectionPlan) => {
    const currentRemaining = Math.max(0, plan.targetMetersCount - plan.disconnectedCount - plan.paidBeforeCutCount - plan.postponedCount);
    if (currentRemaining <= 0) {
      alert('จำนวนงานของแผนนี้ดำเนินการครบตามเป้าหมายแล้ว');
      return;
    }
    const newCount = (plan.disconnectedCount || 0) + 1;
    onUpdatePlanMetrics(plan.id, { disconnectedCount: newCount });
    if (newCount + plan.paidBeforeCutCount + plan.postponedCount >= plan.targetMetersCount) {
      onUpdatePlanStatus(plan.id, 'COMPLETED');
    } else {
      onUpdatePlanStatus(plan.id, 'IN_PROGRESS');
    }
  };

  const handleQuickAddPaid = (plan: DisconnectionPlan) => {
    const currentRemaining = Math.max(0, plan.targetMetersCount - plan.disconnectedCount - plan.paidBeforeCutCount - plan.postponedCount);
    if (currentRemaining <= 0) {
      alert('จำนวนงานของแผนนี้ดำเนินการครบตามเป้าหมายแล้ว');
      return;
    }
    const newCount = (plan.paidBeforeCutCount || 0) + 1;
    onUpdatePlanMetrics(plan.id, { paidBeforeCutCount: newCount });
    if (plan.disconnectedCount + newCount + plan.postponedCount >= plan.targetMetersCount) {
      onUpdatePlanStatus(plan.id, 'COMPLETED');
    } else {
      onUpdatePlanStatus(plan.id, 'IN_PROGRESS');
    }
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Date Selector & Fast Switcher Bar */}
      <div className="bg-white rounded-2xl border border-purple-200/80 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Main Selected Date Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex flex-col items-center justify-center shadow-md shadow-purple-200 shrink-0">
              <Calendar className="w-5 h-5 text-purple-200" />
              <span className="text-[10px] font-bold mt-0.5 font-mono">
                {selectedDate.split('-')[2] || '01'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[11px] font-bold">
                  วันปฏิบัติงานงดจ่ายไฟ
                </span>
                {selectedDate === '2026-09-01' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> วันที่เป้าหมายตัวอย่าง (1 ก.ย. 2569)
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                {formatThaiDate(selectedDate)}
              </h2>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>การไฟฟ้า: <strong className="text-slate-800">{selectedOfficeId === 'ALL' ? 'ทุกการไฟฟ้า' : (getOffice(selectedOfficeId)?.name || selectedOfficeId)}</strong></span>
                <span>•</span>
                <span>มอบหมายแล้ว: <strong className="text-purple-700">{dailyPlans.length} ชุดงาน</strong></span>
              </div>
            </div>
          </div>

          {/* Date Controls & Quick Date Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Quick shortcuts */}
            <button
              onClick={() => setSelectedDate('2026-09-01')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                selectedDate === '2026-09-01'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              1 ก.ย. 2569
            </button>

            <button
              onClick={() => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                setSelectedDate(`${yyyy}-${mm}-${dd}`);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
            >
              วันนี้
            </button>

            {/* Shift Day buttons */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => handleShiftDate(-1)}
                className="p-1 rounded hover:bg-white text-slate-700 transition"
                title="ย้อนหลัง 1 วัน"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 px-2 py-0.5 outline-none cursor-pointer"
              />

              <button
                onClick={() => handleShiftDate(1)}
                className="p-1 rounded hover:bg-white text-slate-700 transition"
                title="ล่วงหน้า 1 วัน"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Create New Plan on This Date */}
            <button
              onClick={onOpenNewPlan}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition ml-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ เพิ่มงานวันนี้</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Key Daily Summary Metrics Bar (ได้รับงานงดตัดกี่ราย vs คงเหลือให้วันนี้ทั้งหมดกี่ราย) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Total Assigned Today (ได้รับงานงดตัดกี่ราย) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ได้รับงานงดตัดวันนี้</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ZapOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {totalAssignedToday} <span className="text-xs font-normal text-slate-500">ราย</span>
            </div>
            <div className="text-[11px] text-purple-700 mt-0.5 font-medium">
              จาก {dailyPlans.length} แผนงาน/ชุดงาน
            </div>
          </div>
        </div>

        {/* Disconnected Count (ตัดแล้ว) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">งดจ่ายไฟแล้ว (ตัดแล้ว)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-700 font-mono">
              {totalDisconnectedToday} <span className="text-xs font-normal text-slate-500">ราย</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              คิดเป็น {totalAssignedToday > 0 ? Math.round((totalDisconnectedToday / totalAssignedToday) * 100) : 0}% ของงาน
            </div>
          </div>
        </div>

        {/* Paid before cut (ชำระแล้ว) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ชำระเงินก่อนตัด</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {totalPaidToday} <span className="text-xs font-normal text-slate-500">ราย</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              ชำระหน้างาน / QR Code
            </div>
          </div>
        </div>

        {/* Postponed (ผ่อนผัน/เลื่อน) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ผ่อนผัน / เลื่อน</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-700 font-mono">
              {totalPostponedToday} <span className="text-xs font-normal text-slate-500">ราย</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              มีเหตุจำเป็น / ผู้ป่วย
            </div>
          </div>
        </div>

        {/* Total Remaining Today (คงเหลือให้วันนี้ทั้งหมด) - Highlighted! */}
        <div className={`p-4 rounded-xl border col-span-2 sm:col-span-1 shadow-xs transition ${
          totalRemainingToday > 0 
            ? 'bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 border-rose-300' 
            : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              ⏳ คงเหลือให้วันนี้ทั้งหมด
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              totalRemainingToday > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {totalRemainingToday > 0 ? 'คงค้าง' : 'ครบถ้วน'}
            </span>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black font-mono ${
              totalRemainingToday > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              {totalRemainingToday} <span className="text-xs font-normal text-slate-700">ราย</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              ความคืบหน้ารวม <strong className="text-slate-900">{dailyCompletionRate}%</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Daily Plans Table per Contractor & Device */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Filters & Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-700" />
              <span>การแจกแจงงานรายผู้รับจ้าง & เครื่องประจำวันที่ {formatShortThaiDate(selectedDate)}</span>
            </h3>
            <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
              {dailyPlans.length} รายการ
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Contractor filter */}
            <select
              value={filterContractorId}
              onChange={(e) => setFilterContractorId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium outline-none"
            >
              <option value="ALL">ผู้รับจ้าง: ทั้งหมด</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium outline-none"
            >
              <option value="ALL">สถานะ: ทั้งหมด</option>
              <option value="IN_PROGRESS">กำลังปฏิบัติงาน</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
              <option value="PLANNED">มีแผนแล้ว</option>
              <option value="POSTPONED">ผ่อนผัน</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {dailyPlans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              ไม่มีแผนงานงดจ่ายไฟในวันที่ {formatThaiDate(selectedDate)}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              คุณสามารถกดเลือกวันที่ 1 ก.ย. 2569 เพื่อดูข้อมูลตัวอย่าง หรือกดปุ่มด้านล่างเพื่อเพิ่มแผนงานงดตัดไฟในวันนี้
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setSelectedDate('2026-09-01')}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition"
              >
                ดูวันที่ 1 ก.ย. 2569
              </button>
              <button
                onClick={onOpenNewPlan}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มแผนงานวันที่นี้</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-10 text-center">ลำดับ</th>
                  <th className="py-3 px-3.5">การไฟฟ้า / รหัสแผน</th>
                  <th className="py-3 px-3.5">
                    <span className="text-amber-900 font-bold">1. รหัส & ชื่อผู้รับจ้าง</span>
                  </th>
                  <th className="py-3 px-3.5">
                    <span className="text-blue-900 font-bold">2. เครื่อง & ผู้ถือเครื่อง</span>
                  </th>
                  <th className="py-3 px-3.5">
                    <span className="text-emerald-900 font-bold">3. พอตชั่น & 4. สาย</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-purple-50/50">
                    ได้รับงานงดตัด
                  </th>
                  <th className="py-3 px-2.5 text-center text-rose-700">ตัดแล้ว</th>
                  <th className="py-3 px-2.5 text-center text-emerald-700">ชำระแล้ว</th>
                  <th className="py-3 px-2.5 text-center text-amber-700">ผ่อนผัน</th>
                  <th className="py-3 px-3.5 text-center bg-amber-50/60 font-black text-rose-900">
                    คงเหลือวันนี้
                  </th>
                  <th className="py-3 px-3.5 text-center">ความคืบหน้า</th>
                  <th className="py-3 px-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyPlans.map((plan, index) => {
                  const office = getOffice(plan.officeId);
                  const remaining = Math.max(0, plan.targetMetersCount - plan.disconnectedCount - plan.paidBeforeCutCount - plan.postponedCount);
                  const processed = plan.disconnectedCount + plan.paidBeforeCutCount + plan.postponedCount;
                  const rate = plan.targetMetersCount > 0 ? Math.round((processed / plan.targetMetersCount) * 100) : 0;

                  return (
                    <tr key={plan.id} className="hover:bg-purple-50/30 transition">
                      {/* Index */}
                      <td className="py-3 px-3.5 text-center font-mono text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      {/* Office & Plan Code */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-slate-900 font-mono">
                          {plan.planCode}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          {office ? office.name : plan.officeId}
                        </div>
                        <div className="mt-1">
                          {office?.type === 'PRIMARY' ? (
                            <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                              ต้นสังกัด
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                              ในสังกัด
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 1. ผู้รับจ้าง */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono font-bold text-[11px]">
                          {plan.contractorCode}
                        </div>
                        <div className="font-semibold text-slate-800 mt-1">
                          {plan.contractorName}
                        </div>
                      </td>

                      {/* 2. เครื่อง */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-mono font-bold text-[11px]">
                          {plan.deviceCode}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          ผู้ถือ: <strong>{plan.deviceContractorName || plan.contractorName}</strong>
                        </div>
                      </td>

                      {/* 3. พอตชั่น & 4. สาย */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            พอตชั่น {plan.portionNumber}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            (จด {plan.readingDate})
                          </span>
                        </div>
                        <div className="font-medium text-slate-800 mt-1 text-[11px]">
                          {plan.route}
                        </div>
                      </td>

                      {/* ได้รับงานงดตัด (Assigned Target) */}
                      <td className="py-3 px-3 text-center align-top bg-purple-50/30">
                        <div className="font-bold text-sm text-purple-900 font-mono">
                          {plan.targetMetersCount}
                        </div>
                        <div className="text-[10px] text-slate-500">ราย</div>
                      </td>

                      {/* ตัดแล้ว */}
                      <td className="py-3 px-2.5 text-center align-top">
                        <div className="font-bold text-sm text-rose-700 font-mono">
                          {plan.disconnectedCount}
                        </div>
                        <button
                          onClick={() => handleQuickAddDisconnected(plan)}
                          className="mt-1 text-[10px] text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded px-1.5 py-0.5 font-semibold transition"
                          title="กด +1 ตัดไฟแล้ว"
                        >
                          +1 ตัด
                        </button>
                      </td>

                      {/* ชำระแล้ว */}
                      <td className="py-3 px-2.5 text-center align-top">
                        <div className="font-bold text-sm text-emerald-700 font-mono">
                          {plan.paidBeforeCutCount}
                        </div>
                        <button
                          onClick={() => handleQuickAddPaid(plan)}
                          className="mt-1 text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded px-1.5 py-0.5 font-semibold transition"
                          title="กด +1 ชำระเงินแล้ว"
                        >
                          +1 จ่าย
                        </button>
                      </td>

                      {/* ผ่อนผัน */}
                      <td className="py-3 px-2.5 text-center align-top">
                        <div className="font-bold text-sm text-amber-700 font-mono">
                          {plan.postponedCount}
                        </div>
                      </td>

                      {/* คงเหลือวันนี้ (Remaining Workload Today) */}
                      <td className="py-3 px-3.5 text-center align-top bg-amber-50/50">
                        <div className={`font-black text-base font-mono ${
                          remaining > 0 ? 'text-rose-700' : 'text-emerald-700'
                        }`}>
                          {remaining}
                        </div>
                        <div className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block ${
                          remaining > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {remaining > 0 ? 'คงเหลือ' : 'เสร็จครบ'}
                        </div>
                      </td>

                      {/* Progress Bar & Status */}
                      <td className="py-3 px-3.5 align-top min-w-[120px]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                          <span>{rate}%</span>
                          <span className={`text-[10px] ${
                            plan.status === 'COMPLETED' ? 'text-emerald-700' :
                            plan.status === 'IN_PROGRESS' ? 'text-amber-700' : 'text-slate-500'
                          }`}>
                            {plan.status === 'COMPLETED' ? 'เสร็จสิ้น' :
                             plan.status === 'IN_PROGRESS' ? 'กำลังทำ' : 'มีแผน'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              rate >= 100 ? 'bg-emerald-600' :
                              rate > 50 ? 'bg-purple-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, rate)}%` }}
                          />
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-3.5 align-top text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onPrintPlan(plan)}
                          className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                          title="พิมพ์ใบสั่งงานภาคสนาม"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditPlan(plan)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                          title="แก้ไขแผนงาน / ผลการตัดไฟ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Daily Summary Footer */}
        {dailyPlans.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
            <div>
              สรุปประจำวันที่ <strong className="text-slate-900">{formatShortThaiDate(selectedDate)}</strong>: ได้รับงานทั้งหมด{' '}
              <strong className="text-purple-700 font-mono">{totalAssignedToday}</strong> ราย | ตัดแล้ว{' '}
              <strong className="text-rose-700 font-mono">{totalDisconnectedToday}</strong> ราย | ชำระแล้ว{' '}
              <strong className="text-emerald-700 font-mono">{totalPaidToday}</strong> ราย | คงเหลือวันนี้{' '}
              <strong className="text-rose-900 font-mono bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{totalRemainingToday}</strong> ราย
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span>อัตราสำเร็จรวม:</span>
              <span className="text-purple-900 font-mono text-sm">{dailyCompletionRate}%</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
