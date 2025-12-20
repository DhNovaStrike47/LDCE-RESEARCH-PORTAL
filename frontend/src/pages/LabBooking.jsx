import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api'; // 🟢 Import API_URL

const LabBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); 
    
    const [formData, setFormData] = useState({
        labName: 'IoT Lab (Dept IT)',
        date: '',
        timeSlot: '', 
        reason: '',
        email: '' 
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
            fetchBookings();
            const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
            if(userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setFormData(prev => ({ ...prev, email: user.email ? user.email : '' }));
                } catch (e) { console.error(e); }
            }
        }
    }, [token]);

    const fetchBookings = () => {
        // 🟢 Use API_URL
        axios.get(`${API_URL}/api/labs/my-bookings`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setBookings(res.data);
                setSelectedIds([]);
            })
            .catch(err => console.error(err));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!formData.timeSlot) {
            alert("Please select a valid time slot.");
            return;
        }

        setLoading(true);
        try {
            // 🟢 Use API_URL
            await axios.post(`${API_URL}/api/labs/book`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`✅ Booking Success!\n📧 Confirmation sent to ${formData.email}`);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || "Error booking lab");
        } finally {
            setLoading(false);
        }
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
        if(!window.confirm(`Are you sure you want to withdraw ${selectedIds.length} requests?`)) return;
        try {
            // 🟢 Use API_URL
            await axios.post(`${API_URL}/api/labs/delete-batch`, { ids: selectedIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Requests Withdrawn Successfully.");
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || "Batch delete failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="container mx-auto p-8 max-w-5xl">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">🧪 Lab Resource Booking</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
                        <h3 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">Request a Slot</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Confirmation Email <span className="text-red-500">*</span></label>
                                <input type="email" className="w-full p-3 border rounded-lg bg-blue-50 border-blue-200" 
                                    placeholder="Enter your email"
                                    value={formData.email || ""} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Select Lab <span className="text-red-500">*</span></label>
                                <select className="w-full p-3 border rounded-lg bg-gray-50" onChange={(e) => setFormData({...formData, labName: e.target.value})}>
                                    <option>IoT Lab (Dept IT)</option>
                                    <option>AI/ML Lab (Dept CS)</option>
                                    <option>Fluid Mechanics Lab (Dept Civil)</option>
                                    <option>High Voltage Lab (Dept Electrical)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Date <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        className="w-full p-3 border rounded-lg" 
                                        required 
                                        min={today} 
                                        value={formData.date}
                                        onChange={(e) => {
                                            setFormData({...formData, date: e.target.value, timeSlot: ''}); 
                                        }} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Time Slot <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full p-3 border rounded-lg bg-gray-50" 
                                        required
                                        value={formData.timeSlot}
                                        onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                                    >
                                        <option value="">-- Select Time --</option>
                                        {availableSlots.map((slot) => {
                                            const isPast = formData.date === today && currentHour >= slot.startHour;
                                            return (
                                                <option 
                                                    key={slot.label} 
                                                    value={slot.label} 
                                                    disabled={isPast}
                                                    className={isPast ? "text-gray-400 bg-gray-100" : ""}
                                                >
                                                    {slot.label} {isPast ? "(Passed)" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Purpose of Visit <span className="text-red-500">*</span></label>
                                <textarea className="w-full p-3 border rounded-lg h-24" placeholder="Reason for booking..." required onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full text-white py-3 rounded-lg font-bold shadow transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Booking Slot...' : '📅 Book Slot & Send Email'}
                            </button>
                        </form>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-700">My Schedule</h3>
                            <div className="flex gap-2">
                                <button onClick={handleSelectAllPending} className="text-sm text-blue-600 hover:underline">
                                    {selectedIds.length > 0 ? "Deselect All" : "Select All Pending"}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button 
                                        onClick={handleBatchWithdraw}
                                        className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 font-bold shadow"
                                    >
                                        Delete ({selectedIds.length})
                                    </button>
                                )}
                            </div>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="text-gray-400 italic">No bookings found.</div>
                        ) : (
                            <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {bookings.map(b => (
                                    <div key={b._id} className={`bg-white p-4 rounded-lg shadow-sm border flex items-center gap-3 relative overflow-hidden transition-all ${selectedIds.includes(b._id) ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}>
                                        <div className="flex-shrink-0">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 cursor-pointer accent-red-500"
                                                checked={selectedIds.includes(b._id)}
                                                onChange={() => toggleSelection(b._id)}
                                                disabled={b.status !== 'Pending'} 
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm">{b.labName}</h4>
                                                    <p className="text-xs text-gray-500">{b.date} • {b.timeSlot}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {b.status}
                                                </span>
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