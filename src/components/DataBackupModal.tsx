import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  FileCode, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Office, Contractor, Device, Portion, DisconnectionPlan } from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  offices: Office[];
  contractors: Contractor[];
  devices: Device[];
  portions: Portion[];
  plans: DisconnectionPlan[];
  onResetToDefault: () => void;
  onImportData: (data: any) => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  offices,
  contractors,
  devices,
  portions,
  plans,
  onResetToDefault,
  onImportData,
}) => {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const fullData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      offices,
      contractors,
      devices,
      portions,
      plans,
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pea-disconnection-plans-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV of Plans with the 4 key requirements
  const handleExportCSV = () => {
    const headers = [
      'รหัสแผนงาน',
      'สำนักงานสังกัด',
      'รหัสผู้รับจ้าง',
      'ชื่อผู้รับจ้าง',
      'รหัสเครื่อง',
      'ชื่อผู้รับจ้างเครื่องนั้นๆ',
      'พอตชั่น',
      'วันที่จดหน่วย',
      'สายของพอตชั่น',
      'วันที่งดจ่ายไฟ',
      'เป้าหมาย(ราย)',
      'ตัดแล้ว(ราย)',
      'ชำระแล้ว(ราย)',
      'สถานะ',
      'หมายเหตุ',
    ];

    const rows = plans.map((p) => {
      const office = offices.find((o) => o.id === p.officeId);
      return [
        `"${p.planCode}"`,
        `"${office ? office.name : p.officeId}"`,
        `"${p.contractorCode}"`,
        `"${p.contractorName}"`,
        `"${p.deviceCode}"`,
        `"${p.deviceContractorName || p.contractorName}"`,
        `"${p.portionNumber}"`,
        `"${p.readingDate}"`,
        `"${p.route}"`,
        `"${p.disconnectionDate}"`,
        p.targetMetersCount,
        p.disconnectedCount,
        p.paidBeforeCutCount,
        `"${p.status}"`,
        `"${p.notes || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pea-disconnection-plans-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importText);
      onImportData(parsed);
      alert('นำเข้าข้อมูลสำเร็จเรียบร้อย!');
      setImportText('');
      onClose();
    } catch (e) {
      alert('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base">สำรองข้อมูล / ส่งออกและนำเข้าข้อมูล</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto">
          
          {/* Export section */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Download className="w-4 h-4 text-purple-700" />
              <span>ส่งออกข้อมูล (Export)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportCSV}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition flex items-start gap-3"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">ส่งออกตาราง CSV / Excel</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    แผนงานงดจ่ายไฟพร้อมผู้รับจ้าง เครื่อง พอตชั่น และสาย
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition flex items-start gap-3"
              >
                <FileCode className="w-6 h-6 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-900">สำรองฐานข้อมูลเต็ม (JSON)</div>
                  <div className="text-[11px] text-purple-700 mt-0.5">
                    รวมทั้งต้นสังกัด, ในสังกัด, ผู้รับจ้าง, เครื่อง, พอตชั่น และสาย
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Upload className="w-4 h-4 text-blue-700" />
              <span>นำเข้าข้อมูลสำรอง (Import JSON)</span>
            </h4>

            <textarea
              rows={3}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="วางโค้ด JSON ข้อมูลสำรองที่นี่..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-slate-800 text-xs outline-none focus:bg-white focus:border-purple-600"
            />

            {importText.trim() && (
              <button
                onClick={handleImportJSON}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ยืนยันการนำเข้าข้อมูล</span>
              </button>
            )}
          </div>

          {/* Reset section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-rose-900 text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>รีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้น</span>
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  จะล้างข้อมูลที่บันทึกไว้ในเบราว์เซอร์ และโหลดชุดข้อมูลตัวอย่างมาตรฐาน
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดเป็นค่าเริ่มต้นใช่หรือไม่?')) {
                    onResetToDefault();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs whitespace-nowrap transition"
              >
                รีเซ็ตข้อมูล
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
