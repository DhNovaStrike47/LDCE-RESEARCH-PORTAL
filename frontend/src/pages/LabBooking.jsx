import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api'; 
import { Beaker, Calendar, Clock, ClipboardList, CheckCircle, XCircle, Trash2, ShieldCheck } from 'lucide-react';

const LAB_OPTIONS = [
    { name: 'IoT Lab (Dept IT)', facultyEmail: 'ideame618@gmail.com' },
    { name: 'AI/ML Lab (Dept CS)', facultyEmail: 'dhanvipatel0611@gmail.com' },
    { name: 'Fluid Mechanics Lab (Dept Civil)', facultyEmail: 'faculty.civil@ldce.ac.in' },
    { name: 'High Voltage Lab (Dept Electrical)', facultyEmail: 'faculty.electrical@ldce.ac.in' }
];

const LabBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [projects, setProjects] = useState([]); 
    const [selectedIds, setSelectedIds] = useState([]); 
    
    const [formData, setFormData] = useState({
        labName: LAB_OPTIONS[0].name,
        date: '',
        timeSlot: '', 
        reason: '',
        email: '',
        projectId: '' 
    });

    const [loading, setLoading] = useState(false);
    const today = new Date().toLocaleDateString('en-CA'); 
    const currentHour = new Date().getHours();

    const availableSlots = [
        { label: "10:00 AM - 12:00 PM", startHour: 10 },
        { label: "02:00 PM - 04:00 PM", startHour: 14 },
        { label: "04:00 PM - 06:00 PM", startHour: 16 }
    ];

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    useEffect(() => {
        if(token) {
            fetchData();
            const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
            if(userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setFormData(prev => ({ ...prev, email: user.email || '' }));
                } catch (e) { console.error(e); }
            }
        }
    }, [token]);

    const fetchData = async () => {
        try {
            const bookingRes = await axios.get(`${API_URL}/api/labs/my-bookings`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setBookings(bookingRes.data);
            setSelectedIds([]);

            const projectRes = await axios.get(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(projectRes.data);
        } catch (err) { console.error("Data load error:", err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.timeSlot) return alert("Please select a valid time slot.");
        if(!formData.projectId) return alert("Please select a project for this booking.");

        const selectedLab = LAB_OPTIONS.find(l => l.name === formData.labName);
        const facultyEmail = selectedLab ? selectedLab.facultyEmail : "";

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/labs/book`, {
                ...formData,
                facultyEmail 
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert(`✅ Booking Dispatched Successfully.`);
            fetchData(); 
            setFormData(prev => ({ ...prev, reason: '', date: '', timeSlot: '' }));
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed");
        } finally { setLoading(false); }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSelectAllPending = () => {
        if (selectedIds.length > 0) setSelectedIds([]); 
        else {
            const pendingIds = bookings.filter(b => b.status === 'Pending').map(b => b._id);
            setSelectedIds(pendingIds);
        }
    };

    const handleBatchWithdraw = async () => {
        if(!window.confirm(`Withdraw ${selectedIds.length} pending requests?`)) return;
        try {
            await axios.post(`${API_URL}/api/labs/delete-batch`, { ids: selectedIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) { alert("Withdrawal failed."); }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            <Navbar />
            <div className="container mx-auto p-8 max-w-6xl">
                <div className="mb-10 border-b border-slate-200 pb-5">
                    <h2 className="text-2xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                        <Beaker className="text-[#6366F1]" size={24}/> Lab Resource Allocation
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Reserve specialized institutional equipment and workspace.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* BOOKING FORM SECTION */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-fit">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ClipboardList size={14}/> Reservation Dossier
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Verification Email</label>
                                    <input type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none" 
                                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Laboratory Unit</label>
                                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none cursor-pointer" 
                                        value={formData.labName} onChange={(e) => setFormData({...formData, labName: e.target.value})}>
                                        {LAB_OPTIONS.map(lab => <option key={lab.name} value={lab.name}>{lab.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Linked Research Project</label>
                                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none cursor-pointer" 
                                        value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})} required>
                                        <option value="">-- Associate Project --</option>
                                        {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Calendar size={12}/> Date</label>
                                        <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none" 
                                            required min={today} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value, timeSlot: ''})} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Clock size={12}/> Slot</label>
                                        <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none cursor-pointer" 
                                            required value={formData.timeSlot} onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}>
                                            <option value="">-- Select --</option>
                                            {availableSlots.map((slot) => {
                                                const isPast = formData.date === today && currentHour >= slot.startHour;
                                                return <option key={slot.label} value={slot.label} disabled={isPast}>{slot.label}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Requirement Details</label>
                                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium h-24 focus:border-[#6366F1] outline-none placeholder:text-slate-300" 
                                        placeholder="Specific equipment or technical assistance required..." required 
                                        value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                                </div>
                                
                                <button type="submit" disabled={loading} className="w-full bg-[#0B0F19] text-white py-3 rounded-xl text-sm font-medium transition shadow-sm hover:bg-slate-800 disabled:opacity-50">
                                    {loading ? 'Dispatched...' : 'Request Lab Allocation'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* BOOKINGS LIST SECTION */}
                    <div className="lg:col-span-7">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14}/> Active Schedule
                                </h3>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleSelectAllPending} className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest hover:underline">
                                    {selectedIds.length > 0 ? "Deselect All" : "Selection Mode"}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button onClick={handleBatchWithdraw} className="bg-red-50 text-red-500 text-[10px] px-3 py-1 rounded-full border border-red-100 font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition">
                                        Withdraw ({selectedIds.length})
                                    </button>
                                )}
                            </div>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="bg-white p-20 rounded-2xl border border-dashed border-slate-200 text-center">
                                <p className="text-sm font-medium text-slate-400 italic">No historical reservations found in the repository.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                {bookings.map(b => (
                                    <div key={b._id} className={`bg-white p-5 rounded-xl border transition-all flex items-center gap-4 ${selectedIds.includes(b._id) ? 'border-red-200 bg-red-50/30' : 'border-slate-200 shadow-sm'}`}>
                                        <div className="flex-shrink-0">
                                            <input type="checkbox" className="w-4 h-4 cursor-pointer accent-red-500 rounded"
                                                checked={selectedIds.includes(b._id)} onChange={() => toggleSelection(b._id)}
                                                disabled={b.status !== 'Pending'} />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-0.5">{b.labName}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{b.date} • {b.timeSlot}</p>
                                                    {b.project && (
                                                        <div className="flex items-center gap-1.5 text-indigo-500/80">
                                                            <span className="text-[10px] font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 line-clamp-1">
                                                                ASSOCIATED PROJECT: {b.project.title}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                                                        b.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                        b.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabBooking;