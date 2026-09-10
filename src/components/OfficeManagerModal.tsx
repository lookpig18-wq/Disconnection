import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Building2, 
  Check, 
  ShieldAlert,
  Phone,
  MapPin,
  UserCheck
} from 'lucide-react';
import { Office, OfficeType } from '../types';

interface OfficeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  offices: Office[];
  onAddOffice: (office: Omit<Office, 'id'>) => void;
  onUpdateOffice: (id: string, updated: Partial<Office>) => void;
  onDeleteOffice: (id: string) => void;
}

export const OfficeManagerModal: React.FC<OfficeManagerModalProps> = ({
  isOpen,
  onClose,
  offices,
  onAddOffice,
  onUpdateOffice,
  onDeleteOffice,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form states
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<OfficeType>('SUB_OFFICE');
  const [parentId, setParentId] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');

  const primaryOffices = offices.filter((o) => o.type === 'PRIMARY');

  const startAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setCode(`PEA-${Date.now().toString().slice(-4)}`);
    setName('');
    setType('SUB_OFFICE');
    setParentId(primaryOffices[0]?.id || '');
    setAddress('');
    setPhone('');
    setManagerName('');
  };

  const startEdit = (office: Office) => {
    setEditingId(office.id);
    setIsAddingNew(false);
    setCode(office.code);
    setName(office.name);
    setType(office.type);
    setParentId(office.parentId || '');
    setAddress(office.address || '');
    setPhone(office.phone || '');
    setManagerName(office.managerName || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('กรุณากรอกชื่อและรหัสสังกัดการไฟฟ้า');
      return;
    }

    if (isAddingNew) {
      onAddOffice({
        code: code.trim(),
        name: name.trim(),
        type,
        parentId: type === 'SUB_OFFICE' ? parentId : undefined,
        address: address.trim(),
        phone: phone.trim(),
        managerName: managerName.trim(),
      });
      setIsAddingNew(false);
    } else if (editingId) {
      onUpdateOffice(editingId, {
        code: code.trim(),
        name: name.trim(),
        type,
        parentId: type === 'SUB_OFFICE' ? parentId : undefined,
        address: address.trim(),
        phone: phone.trim(),
        managerName: managerName.trim(),
      });
      setEditingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                จัดการข้อมูลการไฟฟ้าต้นสังกัด และ ไฟฟ้าในสังกัด
              </h3>
              <p className="text-xs text-slate-400">
                เพิ่ม ลบ แก้ไข ข้อมูลหน่วยงานการไฟฟ้าต้นสังกัดและสาขาย่อยในสังกัด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-slate-600 font-medium">
              รายชื่อสำนักงานในระบบทั้งหมด ({offices.length} แห่ง)
            </div>
            {!isAddingNew && !editingId && (
              <button
                onClick={startAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มหน่วยงานใหม่</span>
              </button>
            )}
          </div>

          {/* Form for Add or Edit */}
          {(isAddingNew || editingId) && (
            <form onSubmit={handleSubmit} className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 space-y-4">
              <div className="font-bold text-purple-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-700" />
                <span>{isAddingNew ? 'เพิ่มสังกัดการไฟฟ้าใหม่' : 'แก้ไขข้อมูลสังกัดการไฟฟ้า'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ประเภทสังกัด *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as OfficeType)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-purple-600"
                  >
                    <option value="PRIMARY">⚡ ไฟฟ้าต้นสังกัด (Primary / Head Office)</option>
                    <option value="SUB_OFFICE">🔌 ไฟฟ้าในสังกัด (Sub-Office / Branch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    รหัสสังกัด *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="เช่น PEA-HQ-01, PEA-SUB-01"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-medium text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                {type === 'SUB_OFFICE' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      สังกัดภายใต้ (ต้นสังกัดแม่)
                    </label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:border-purple-600"
                    >
                      <option value="">-- ไม่ระบุ --</option>
                      {primaryOffices.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ชื่อหน่วยงานการไฟฟ้า *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="เช่น การไฟฟ้าส่วนภูมิภาค สาขาหลัก, การไฟฟ้าส่วนภูมิภาค สาขาย่อย อ.เมือง"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ผู้จัดการ / หัวหน้าแผนก
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล หัวหน้าผู้รับผิดชอบ"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 02-123-4567"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ที่ตั้ง / สถานที่ทำการ
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ที่อยู่สำนักงาน"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-200">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAddingNew ? 'เพิ่มสังกัด' : 'บันทึกการแก้ไข'}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Offices Divided into Primary and Sub-Offices */}
          <div className="space-y-4">
            {/* 1. ไฟฟ้าต้นสังกัด */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  ⚡ ไฟฟ้าต้นสังกัด (Primary Authority)
                </h4>
              </div>

              <div className="space-y-2">
                {primaryOffices.map((office) => (
                  <div
                    key={office.id}
                    className="bg-white border border-purple-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:shadow-xs transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {office.name}
                        </span>
                        <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                          {office.code}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] mt-1">
                        {office.managerName && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {office.managerName}
                          </span>
                        )}
                        {office.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {office.phone}
                          </span>
                        )}
                        {office.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {office.address}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => startEdit(office)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (offices.length <= 1) {
                            alert('ต้องมีสำนักงานการไฟฟ้าอย่างน้อย 1 แห่งในระบบ');
                            return;
                          }
                          if (window.confirm(`ยืนยันการลบ ${office.name}?`)) {
                            onDeleteOffice(office.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. ไฟฟ้าในสังกัด */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  🔌 ไฟฟ้าในสังกัด (Sub-Offices / Branches)
                </h4>
              </div>

              <div className="space-y-2">
                {offices.filter((o) => o.type === 'SUB_OFFICE').length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-500">
                    ยังไม่มีข้อมูลไฟฟ้าในสังกัด กดปุ่ม &quot;+ เพิ่มหน่วยงานใหม่&quot; เพื่อเพิ่มสาขาย่อย
                  </div>
                ) : (
                  offices.filter((o) => o.type === 'SUB_OFFICE').map((office) => {
                    const parent = offices.find((p) => p.id === office.parentId);
                    return (
                      <div
                        key={office.id}
                        className="bg-white border border-blue-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:shadow-xs transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {office.name}
                            </span>
                            <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-200">
                              {office.code}
                            </span>
                            {parent && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                ขึ้นตรงกับ: {parent.name}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] mt-1">
                            {office.managerName && (
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-slate-400" />
                                {office.managerName}
                              </span>
                            )}
                            {office.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {office.phone}
                              </span>
                            )}
                            {office.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {office.address}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            onClick={() => startEdit(office)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                            title="แก้ไข"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`ยืนยันการลบ ${office.name}?`)) {
                                onDeleteOffice(office.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                            title="ลบ"
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
          </div>

        </div>
      </div>
    </div>
  );
};
