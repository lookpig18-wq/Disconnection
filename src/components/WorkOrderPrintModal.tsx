import React from 'react';
import { 
  X, 
  Printer, 
  Zap, 
  Building2, 
  Users, 
  Smartphone, 
  Layers, 
  Calendar, 
  CheckSquare,
  FileText
} from 'lucide-react';
import { DisconnectionPlan, Office } from '../types';

interface WorkOrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: DisconnectionPlan | null;
  offices: Office[];
}

export const WorkOrderPrintModal: React.FC<WorkOrderPrintModalProps> = ({
  isOpen,
  onClose,
  plan,
  offices,
}) => {
  if (!isOpen || !plan) return null;

  const office = offices.find((o) => o.id === plan.officeId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm">
              ตัวอย่างก่อนพิมพ์: ใบสั่งงานและแผนปฏิบัติงานงดจ่ายไฟภาคสนาม
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Area */}
        <div className="p-8 overflow-y-auto font-['Sarabun',sans-serif] text-slate-900 bg-white" id="printable-work-order">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold text-xl">
                  ⚡
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {office ? office.name : 'การไฟฟ้าส่วนภูมิภาค'}
                  </h1>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {office?.type === 'PRIMARY' ? '⚡ หน่วยงานไฟฟ้าต้นสังกัด' : '🔌 หน่วยงานไฟฟ้าในสังกัด'} 
                    {office?.address && ` | ที่อยู่: ${office.address}`}
                    {office?.phone && ` | โทร: ${office.phone}`}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-500 uppercase">ใบสั่งงานงดจ่ายไฟ</div>
                <div className="text-base font-mono font-bold text-purple-900">{plan.planCode}</div>
                <div className="text-[11px] text-slate-500">วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-lg font-bold text-slate-900 underline underline-offset-4">
                ใบสั่งงานและบันทึกผลการปฏิบัติงานงดจ่ายไฟ (Power Disconnection Work Order)
              </h2>
            </div>
          </div>

          {/* 4 Required Key Items Summary Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs">
            
            {/* 1. ชื่อและรหัสผู้รับจ้าง */}
            <div className="space-y-1">
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>รหัสและชื่อผู้รับจ้าง (Contractor):</span>
              </div>
              <div className="pl-5">
                <div className="font-bold text-sm text-slate-900">{plan.contractorName}</div>
                <div className="font-mono text-slate-600">รหัสผู้รับจ้าง: <strong>{plan.contractorCode}</strong></div>
              </div>
            </div>

            {/* 2. เครื่อง (ชื่อผู้รับจ้างเครื่องนั้นๆ) */}
            <div className="space-y-1">
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>เครื่องและผู้ถือเครื่อง (Device & Assigned Worker):</span>
              </div>
              <div className="pl-5">
                <div className="font-mono font-bold text-sm text-slate-900">รหัสเครื่อง: {plan.deviceCode}</div>
                <div className="text-slate-600">ผู้รับจ้างประจำเครื่อง: <strong>{plan.deviceContractorName || plan.contractorName}</strong></div>
              </div>
            </div>

            {/* 3. วันที่จดหน่วยแต่ละพอตชั่น */}
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>พอตชั่นและวันที่จดหน่วย (Portion & Meter Reading Date):</span>
              </div>
              <div className="pl-5">
                <div className="font-bold text-sm text-emerald-900">พอตชั่น {plan.portionNumber}</div>
                <div className="text-slate-600">วันที่จดหน่วย: <strong>{plan.readingDate}</strong></div>
              </div>
            </div>

            {/* 4. สายของแต่ละพอตชั่น */}
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                <span>สายของพอตชั่นที่ปฏิบัติงาน (Target Route):</span>
              </div>
              <div className="pl-5">
                <div className="font-bold text-sm text-slate-900">{plan.route}</div>
                <div className="text-slate-600">กำหนดวันงดจ่ายไฟ: <strong>{plan.disconnectionDate}</strong> (เป้าหมาย {plan.targetMetersCount} ราย)</div>
              </div>
            </div>
          </div>

          {/* Sample Field Checklist Sheet for Technician */}
          <div className="mb-6">
            <h4 className="font-bold text-xs text-slate-800 mb-2">
              รายการบันทึกผลการปฏิบัติงานภาคสนาม (บันทึกรายมิเตอร์)
            </h4>
            
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="p-2 border-r border-slate-300 text-center w-10">ลำดับ</th>
                  <th className="p-2 border-r border-slate-300 w-32">เลขที่เครื่องวัด/มิเตอร์</th>
                  <th className="p-2 border-r border-slate-300">ชื่อผู้ใช้ไฟฟ้า / สถานที่</th>
                  <th className="p-2 border-r border-slate-300 text-center w-28">ยอดค้างชำระ (บาท)</th>
                  <th className="p-2 border-r border-slate-300 text-center w-36">ผลการดำเนินงาน</th>
                  <th className="p-2 text-center w-28">ลายมือชื่อผู้ใช้ไฟ/พยาน</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(plan.targetMetersCount || 5, 8) }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-200 h-10">
                    <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-300 font-mono text-slate-500">
                      MTR-{plan.portionNumber}-{String(idx + 101).padStart(4, '0')}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-slate-600">
                      {idx === 0 ? 'ร้านค้า / บ้านเลขที่ ...' : '................................................'}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono">
                      {idx === 0 ? '1,450.00' : '............'}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-1">
                          <input type="checkbox" className="w-3 h-3" /> <span>งดจ่ายไฟ (ปลดสาย)</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input type="checkbox" className="w-3 h-3" /> <span>ชำระเงินแล้ว</span>
                        </label>
                      </div>
                    </td>
                    <td className="p-2 text-center text-slate-400">
                      ...............
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {plan.notes && (
            <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
              <span className="font-bold text-amber-900">คำสั่งการพิเศษ / หมายเหตุ: </span>
              <span className="text-amber-800">{plan.notes}</span>
            </div>
          )}

          {/* Signatures Footer */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-300 text-center text-xs mt-8">
            <div className="space-y-8">
              <div>ลงชื่อ .....................................................</div>
              <div>
                ( <strong>{plan.contractorName}</strong> )<br />
                <span className="text-slate-500">ผู้รับจ้างผู้ปฏิบัติงาน (รหัส {plan.contractorCode})</span>
              </div>
            </div>

            <div className="space-y-8">
              <div>ลงชื่อ .....................................................</div>
              <div>
                ( ..................................................... )<br />
                <span className="text-slate-500">พนักงานผู้ควบคุมการงดจ่ายไฟ</span>
              </div>
            </div>

            <div className="space-y-8">
              <div>ลงชื่อ .....................................................</div>
              <div>
                ( <strong>{office?.managerName || 'หัวหน้าแผนกบริการลูกค้า'}</strong> )<br />
                <span className="text-slate-500">ผู้อนุมัติแผนงาน / ผจก.การไฟฟ้า</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
