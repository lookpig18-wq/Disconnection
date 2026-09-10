import React, { useState } from 'react';
import { 
  Users, 
  Smartphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Wrench, 
  Search,
  ArrowRightLeft
} from 'lucide-react';
import { Contractor, Device, Office } from '../types';

interface ContractorAndDeviceTabProps {
  contractors: Contractor[];
  devices: Device[];
  offices: Office[];
  selectedOfficeId: string;
  onAddContractor: (contractor: Omit<Contractor, 'id'>) => void;
  onUpdateContractor: (id: string, updated: Partial<Contractor>) => void;
  onDeleteContractor: (id: string) => void;
  onAddDevice: (device: Omit<Device, 'id'>) => void;
  onUpdateDevice: (id: string, updated: Partial<Device>) => void;
  onDeleteDevice: (id: string) => void;
}

export const ContractorAndDeviceTab: React.FC<ContractorAndDeviceTabProps> = ({
  contractors,
  devices,
  offices,
  selectedOfficeId,
  onAddContractor,
  onUpdateContractor,
  onDeleteContractor,
  onAddDevice,
  onUpdateDevice,
  onDeleteDevice,
}) => {
  const [subView, setSubView] = useState<'both' | 'contractors' | 'devices'>('both');

  // Contractor Form State
  const [isAddingContractor, setIsAddingContractor] = useState(false);
  const [editingContractorId, setEditingContractorId] = useState<string | null>(null);
  const [ctrCode, setCtrCode] = useState('');
  const [ctrName, setCtrName] = useState('');
  const [ctrPhone, setCtrPhone] = useState('');
  const [ctrOfficeId, setCtrOfficeId] = useState('');
  const [ctrStatus, setCtrStatus] = useState<'ACTIVE' | 'INACTIVE' | 'LEAVE'>('ACTIVE');
  const [ctrNotes, setCtrNotes] = useState('');

  // Device Form State
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState('');
  const [devName, setDevName] = useState('');
  const [devOfficeId, setDevOfficeId] = useState('');
  const [devContractorId, setDevContractorId] = useState('');
  const [devStatus, setDevStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'SPARE'>('ACTIVE');
  const [devSerial, setDevSerial] = useState('');

  // Filtered by Office
  const filteredContractors = selectedOfficeId === 'ALL'
    ? contractors
    : contractors.filter((c) => c.officeId === selectedOfficeId);

  const filteredDevices = selectedOfficeId === 'ALL'
    ? devices
    : devices.filter((d) => d.officeId === selectedOfficeId);

  // Contractor actions
  const startAddContractor = () => {
    setIsAddingContractor(true);
    setEditingContractorId(null);
    setCtrCode(`CTR-${new Date().getFullYear().toString().slice(-2)}${String(contractors.length + 1).padStart(2, '0')}`);
    setCtrName('');
    setCtrPhone('');
    setCtrOfficeId(selectedOfficeId !== 'ALL' ? selectedOfficeId : (offices[0]?.id || ''));
    setCtrStatus('ACTIVE');
    setCtrNotes('');
  };

  const startEditContractor = (c: Contractor) => {
    setEditingContractorId(c.id);
    setIsAddingContractor(false);
    setCtrCode(c.code);
    setCtrName(c.name);
    setCtrPhone(c.phone);
    setCtrOfficeId(c.officeId);
    setCtrStatus(c.status);
    setCtrNotes(c.notes || '');
  };

  const handleContractorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctrCode.trim() || !ctrName.trim()) {
      alert('กรุณากรอกรหัสและชื่อผู้รับจ้าง');
      return;
    }
    if (isAddingContractor) {
      onAddContractor({
        code: ctrCode.trim(),
        name: ctrName.trim(),
        phone: ctrPhone.trim(),
        officeId: ctrOfficeId,
        status: ctrStatus,
        notes: ctrNotes.trim(),
      });
      setIsAddingContractor(false);
    } else if (editingContractorId) {
      onUpdateContractor(editingContractorId, {
        code: ctrCode.trim(),
        name: ctrName.trim(),
        phone: ctrPhone.trim(),
        officeId: ctrOfficeId,
        status: ctrStatus,
        notes: ctrNotes.trim(),
      });
      setEditingContractorId(null);
    }
  };

  // Device actions
  const startAddDevice = () => {
    setIsAddingDevice(true);
    setEditingDeviceId(null);
    setDevCode(`POS-${String(devices.length + 1).padStart(2, '0')}`);
    setDevName('เครื่องจดหน่วย & ตัดไฟ Smart POS Gen3');
    setDevOfficeId(selectedOfficeId !== 'ALL' ? selectedOfficeId : (offices[0]?.id || ''));
    setDevContractorId('');
    setDevStatus('ACTIVE');
    setDevSerial(`SN-POS-2026-${String(devices.length + 1).padStart(3, '0')}`);
  };

  const startEditDevice = (d: Device) => {
    setEditingDeviceId(d.id);
    setIsAddingDevice(false);
    setDevCode(d.code);
    setDevName(d.name);
    setDevOfficeId(d.officeId);
    setDevContractorId(d.currentContractorId || '');
    setDevStatus(d.status);
    setDevSerial(d.serialNumber || '');
  };

  const handleDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devCode.trim() || !devName.trim()) {
      alert('กรุณากรอกรหัสและชื่อเครื่อง');
      return;
    }
    const contractor = contractors.find((c) => c.id === devContractorId);
    if (isAddingDevice) {
      onAddDevice({
        code: devCode.trim(),
        name: devName.trim(),
        officeId: devOfficeId,
        currentContractorId: devContractorId || undefined,
        currentContractorName: contractor ? contractor.name : undefined,
        status: devStatus,
        serialNumber: devSerial.trim(),
      });
      setIsAddingDevice(false);
    } else if (editingDeviceId) {
      onUpdateDevice(editingDeviceId, {
        code: devCode.trim(),
        name: devName.trim(),
        officeId: devOfficeId,
        currentContractorId: devContractorId || undefined,
        currentContractorName: contractor ? contractor.name : undefined,
        status: devStatus,
        serialNumber: devSerial.trim(),
      });
      setEditingDeviceId(null);
    }
  };

  const getOfficeName = (id: string) => {
    const o = offices.find((off) => off.id === id);
    return o ? o.name : '-';
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <span>1. ชื่อและรหัสผู้รับจ้าง & 2. เครื่อง (ชื่อผู้รับจ้างเครื่องนั้นๆ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการข้อมูลผู้รับจ้างปฏิบัติงานงดจ่ายไฟ และการมอบหมายเครื่องบันทึกข้อมูล/Smart POS ประจำตัว
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setSubView('both')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              subView === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            แสดงคู่กัน (ทั้ง 2 ส่วน)
          </button>
          <button
            onClick={() => setSubView('contractors')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              subView === 'contractors' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            1. ผู้รับจ้าง ({filteredContractors.length})
          </button>
          <button
            onClick={() => setSubView('devices')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              subView === 'devices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            2. เครื่อง ({filteredDevices.length})
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ========================================================================= */}
        {/* SECTION 1: ชื่อและรหัสผู้รับจ้าง (CONTRACTORS) */}
        {/* ========================================================================= */}
        {(subView === 'both' || subView === 'contractors') && (
          <div className="bg-white rounded-xl border border-amber-200/80 shadow-2xs overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3.5 bg-amber-500/10 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    ชื่อและรหัสผู้รับจ้าง (Contractors)
                  </h3>
                  <p className="text-[11px] text-amber-900 font-medium">
                    ผู้รับจ้างตัดไฟและจดหน่วย ({filteredContractors.length} รายการ)
                  </p>
                </div>
              </div>

              {!isAddingContractor && !editingContractorId && (
                <button
                  onClick={startAddContractor}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มผู้รับจ้าง</span>
                </button>
              )}
            </div>

            {/* Form for Contractor Add/Edit */}
            {(isAddingContractor || editingContractorId) && (
              <form onSubmit={handleContractorSubmit} className="p-4 bg-amber-50/40 border-b border-amber-200 space-y-3 text-xs">
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>{isAddingContractor ? '+ เพิ่มข้อมูลผู้รับจ้างใหม่' : 'แก้ไขข้อมูลผู้รับจ้าง'}</span>
                  <button type="button" onClick={() => { setIsAddingContractor(false); setEditingContractorId(null); }}>
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      1. รหัสผู้รับจ้าง *
                    </label>
                    <input
                      type="text"
                      value={ctrCode}
                      onChange={(e) => setCtrCode(e.target.value)}
                      required
                      placeholder="เช่น CTR-6701, 88201"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-medium text-slate-800 outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      1. ชื่อผู้รับจ้าง (ชื่อ-นามสกุล / หจก.) *
                    </label>
                    <input
                      type="text"
                      value={ctrName}
                      onChange={(e) => setCtrName(e.target.value)}
                      required
                      placeholder="เช่น นายมนัส ปรีชาการ (หจก. ปรีชาการไฟฟ้า)"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      สังกัดการไฟฟ้า *
                    </label>
                    <select
                      value={ctrOfficeId}
                      onChange={(e) => setCtrOfficeId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-amber-600"
                    >
                      {offices.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input
                      type="text"
                      value={ctrPhone}
                      onChange={(e) => setCtrPhone(e.target.value)}
                      placeholder="เช่น 081-234-5678"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => { setIsAddingContractor(false); setEditingContractorId(null); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>บันทึกผู้รับจ้าง</span>
                  </button>
                </div>
              </form>
            )}

            {/* Contractors List */}
            <div className="p-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[520px]">
              {filteredContractors.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  ไม่พบข้อมูลผู้รับจ้างในสังกัดนี้
                </div>
              ) : (
                filteredContractors.map((c) => {
                  const assignedDevice = devices.find((d) => d.currentContractorId === c.id);
                  return (
                    <div
                      key={c.id}
                      className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-amber-50/30 rounded-lg transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                            {c.code}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {c.name}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] mt-1.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {getOfficeName(c.officeId)}
                          </span>
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {c.phone}
                            </span>
                          )}
                        </div>

                        {assignedDevice ? (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200 text-[11px]">
                            <Smartphone className="w-3 h-3 text-blue-600" />
                            <span>เครื่องประจำตัว: <strong>{assignedDevice.code}</strong> ({assignedDevice.name})</span>
                          </div>
                        ) : (
                          <div className="mt-2 text-[10px] text-slate-400 italic">
                            (ยังไม่ได้มอบหมายเครื่องประจำ)
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditContractor(c)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                          title="แก้ไขข้อมูลผู้รับจ้าง"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบผู้รับจ้าง ${c.name} (${c.code})?`)) {
                              onDeleteContractor(c.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="ลบผู้รับจ้าง"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: เครื่อง และชื่อผู้รับจ้างเครื่องนั้นๆ (DEVICES) */}
        {/* ========================================================================= */}
        {(subView === 'both' || subView === 'devices') && (
          <div className="bg-white rounded-xl border border-blue-200/80 shadow-2xs overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3.5 bg-blue-500/10 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    เครื่อง (ชื่อผู้รับจ้างเครื่องนั้นๆ) (Devices)
                  </h3>
                  <p className="text-[11px] text-blue-900 font-medium">
                    เครื่องบันทึก/Smart POS และผู้ถือเครื่อง ({filteredDevices.length} รายการ)
                  </p>
                </div>
              </div>

              {!isAddingDevice && !editingDeviceId && (
                <button
                  onClick={startAddDevice}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มเครื่อง</span>
                </button>
              )}
            </div>

            {/* Form for Device Add/Edit */}
            {(isAddingDevice || editingDeviceId) && (
              <form onSubmit={handleDeviceSubmit} className="p-4 bg-blue-50/40 border-b border-blue-200 space-y-3 text-xs">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>{isAddingDevice ? '+ เพิ่มข้อมูลเครื่องใหม่' : 'แก้ไขข้อมูลเครื่อง & มอบหมายผู้รับจ้าง'}</span>
                  <button type="button" onClick={() => { setIsAddingDevice(false); setEditingDeviceId(null); }}>
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      2. รหัสเครื่อง *
                    </label>
                    <input
                      type="text"
                      value={devCode}
                      onChange={(e) => setDevCode(e.target.value)}
                      required
                      placeholder="เช่น POS-01, HHT-101"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-medium text-slate-800 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      ชื่อรุ่น / ชนิดเครื่อง *
                    </label>
                    <input
                      type="text"
                      value={devName}
                      onChange={(e) => setDevName(e.target.value)}
                      required
                      placeholder="เช่น Smart POS Gen3, Handheld Terminal"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      2. มอบหมายให้ (ชื่อผู้รับจ้างเครื่องนั้นๆ)
                    </label>
                    <select
                      value={devContractorId}
                      onChange={(e) => setDevContractorId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-blue-600"
                    >
                      <option value="">-- ไม่ระบุ / เครื่องสำรอง --</option>
                      {contractors.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.code}] {c.name} ({getOfficeName(c.officeId)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      สังกัดการไฟฟ้า *
                    </label>
                    <select
                      value={devOfficeId}
                      onChange={(e) => setDevOfficeId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:border-blue-600"
                    >
                      {offices.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      สถานะเครื่อง
                    </label>
                    <select
                      value={devStatus}
                      onChange={(e) => setDevStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:border-blue-600"
                    >
                      <option value="ACTIVE">พร้อมใช้งาน (Active)</option>
                      <option value="MAINTENANCE">ซ่อมบำรุง (Maintenance)</option>
                      <option value="SPARE">เครื่องสำรอง (Spare)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                  <button
                    type="button"
                    onClick={() => { setIsAddingDevice(false); setEditingDeviceId(null); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>บันทึกเครื่อง</span>
                  </button>
                </div>
              </form>
            )}

            {/* Devices List */}
            <div className="p-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[520px]">
              {filteredDevices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  ไม่พบข้อมูลเครื่องในสังกัดนี้
                </div>
              ) : (
                filteredDevices.map((d) => {
                  return (
                    <div
                      key={d.id}
                      className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-blue-50/30 rounded-lg transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                            {d.code}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {d.name}
                          </span>
                          {d.status === 'SPARE' && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              เครื่องสำรอง
                            </span>
                          )}
                          {d.status === 'MAINTENANCE' && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">
                              ส่งซ่อม
                            </span>
                          )}
                        </div>

                        {/* 2. ชื่อผู้รับจ้างเครื่องนั้นๆ */}
                        <div className="mt-1.5 flex items-center gap-1 text-xs">
                          <span className="text-slate-500">ผู้รับจ้างประจำเครื่อง:</span>
                          {d.currentContractorName ? (
                            <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {d.currentContractorName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-- ยังไม่มีผู้ถือเครื่อง --</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] mt-1.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {getOfficeName(d.officeId)}
                          </span>
                          {d.serialNumber && (
                            <span className="font-mono text-[10px] text-slate-400">
                              S/N: {d.serialNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditDevice(d)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                          title="แก้ไขเครื่อง / เปลี่ยนผู้รับจ้าง"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบเครื่อง ${d.code}?`)) {
                              onDeleteDevice(d.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="ลบเครื่อง"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
