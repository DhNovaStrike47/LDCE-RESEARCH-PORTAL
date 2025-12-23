import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_URL from '../api';
import { Download, Plus, ClipboardCheck, History, Send } from 'lucide-react';

const ProjectMilestones = ({ collaborationId, isFaculty, projectTitle, studentName }) => {
    const [milestones, setMilestones] = useState([]);
    const [report, setReport] = useState("");
    const [phase, setPhase] = useState("");
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        axios.get(`${API_URL}/api/milestones/${collaborationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setMilestones(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error("Milestone fetch error", err));
    }, [collaborationId, token]);

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("LDCE Research Milestone Report", 20, 20);
        doc.setFontSize(12);
        doc.text(`Project: ${projectTitle}`, 20, 35);
        doc.text(`Student: ${studentName}`, 20, 42);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 49);

        const tableRows = milestones.map(m => [
            new Date(m.createdAt).toLocaleDateString(),
            m.phase,
            m.report
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['Date', 'Phase', 'Report']],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [11, 15, 25] } // Matching Deep Navy
        });

        doc.save(`${studentName}_Research_Progress.pdf`);
    };

    const submitMilestone = async () => {
        if (!phase || !report) return alert("Please fill all fields");
        try {
            const res = await axios.post(`${API_URL}/api/milestones/add`, {
                collaborationId, phase, report, submittedBy: isFaculty ? 'Faculty' : 'Student'
            }, { headers: { Authorization: `Bearer ${token}` } });
            setMilestones([res.data, ...milestones]);
            setPhase(""); setReport("");
        } catch (err) { alert("Submission failed"); }
    };

    return (
        <div className="mt-12 space-y-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-5 gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                        <ClipboardCheck className="text-[#6366F1]" size={24}/> Research Milestones
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Project Lifecycle Tracking</p>
                </div>
                {milestones.length > 0 && (
                    <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2 bg-[#0B0F19] text-white rounded-xl font-semibold text-[11px] uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm">
                        <Download size={14}/> Export Dossier
                    </button>
                )}
            </div>
            
            {/* Submission Form (Student Only) */}
            {!isFaculty && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Plus className="text-[#6366F1]" size={18}/>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Progress Log</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <input 
                            type="text" 
                            placeholder="Current Phase (e.g., Literature Review, Prototyping)" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#6366F1] outline-none transition-all"
                            value={phase}
                            onChange={(e) => setPhase(e.target.value)}
                        />
                        <textarea 
                            placeholder="Describe technical objectives achieved and blockers encountered..." 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium h-32 focus:border-[#6366F1] outline-none transition-all resize-none"
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={submitMilestone}
                        className="w-full py-3.5 bg-[#6366F1] text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                        <Send size={14}/> Dispatch Progress Report
                    </button>
                </div>
            )}

            {/* Milestone Timeline */}
            <div className="space-y-6 relative">
                {milestones.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <History className="text-slate-400" size={16}/>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Historical Log</span>
                    </div>
                )}
                
                {milestones.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm font-medium text-slate-400 italic">No milestones have been recorded for this collaboration.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {milestones.map((m, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-[#0B0F19] hover:border-slate-300 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-sm font-bold text-[#0B0F19] uppercase tracking-wider">{m.phase}</h4>
                                    <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(m.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 border-indigo-50 pl-4 py-1">
                                    "{m.report}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectMilestones;