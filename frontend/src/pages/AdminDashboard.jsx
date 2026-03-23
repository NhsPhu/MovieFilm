import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalMovies: 0, totalViews: 0, activeNow: 0 })
    useEffect(() => {
        adminService.getStats?.().then(setStats).catch(() => {})
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-extrabold tracking-tighter">Trung Tâm Điều Khiển</h1>
                    <p className="text-stone-500 text-sm mt-1">Tổng quan hệ thống và chỉ số hiệu suất.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-manrope font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-container/20">
                        <span className="material-symbols-outlined text-sm">add</span> Nội Dung Mới
                    </button>
                </div>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {label:'Tổng Người Dùng', val: stats.totalUsers || 0, trend:'', icon:'group', color:'bg-primary-container/10 text-primary'},
                    {label:'Phim Hoạt Động', val: stats.totalMovies || 0, trend:'', icon:'movie', color:'bg-tertiary-container/10 text-tertiary'},
                    {label:'Tổng Lượt Xem', val: stats.totalViews || 0, trend:'', icon:'visibility', color:'bg-secondary-container/10 text-secondary'},
                    {label:'Đang Hoạt Động', val: stats.activeNow || 0, trend:'', icon:'radio_button_checked', color:'bg-error-container/10 text-error'}
                ].map((s,i) => (
                    <div key={i} className="glass-card p-6 rounded-xl border border-outline-variant/10 hover:border-outline-variant/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined">{s.icon}</span>
                            </div>
                            {s.trend && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{s.trend}</span>}
                        </div>
                        <p className="text-3xl font-headline font-extrabold tracking-tight">{s.val}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-widest mt-1 font-bold">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Performance Chart Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 rounded-xl border border-outline-variant/10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-headline font-bold">Phân Tích Lượt Xem</h3>
                            <p className="text-stone-500 text-xs mt-1">Hiệu suất 30 ngày qua</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-primary-container/20 text-primary text-xs font-bold rounded-full">Ngày</button>
                            <button className="px-3 py-1 text-stone-500 text-xs font-bold hover:bg-surface-container-high rounded-full transition-all">Tuần</button>
                            <button className="px-3 py-1 text-stone-500 text-xs font-bold hover:bg-surface-container-high rounded-full transition-all">Tháng</button>
                        </div>
                    </div>
                    {/* Chart Placeholder */}
                    <div className="h-56 flex items-end justify-between gap-2 px-4">
                        {[40,65,45,80,55,90,70,85,50,75,60,95].map((h,i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full rounded-t-lg bg-gradient-to-t from-primary-container/60 to-primary/30 transition-all hover:from-primary-container hover:to-primary" style={{height: `${h}%`}}></div>
                                <span className="text-[9px] text-stone-600">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-8 rounded-xl border border-outline-variant/10">
                    <h3 className="text-xl font-headline font-bold mb-6">Hoạt Động Gần Đây</h3>
                    <div className="space-y-5">
                        <p className="text-sm text-stone-500 italic">Chưa có hoạt động nào.</p>
                    </div>
                </div>
            </div>

            {/* Recent Content Table */}
            <div className="glass-card rounded-xl border border-outline-variant/10 overflow-hidden">
                <div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/10">
                    <h3 className="text-xl font-headline font-bold">Nội Dung Gần Đây</h3>
                    <button className="text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-widest">Xem Tất Cả</button>
                </div>
                <table className="w-full">
                    <thead className="border-b border-outline-variant/10">
                        <tr>
                            <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Tiêu Đề</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Thể Loại</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Trạng Thái</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Lượt Xem</th>
                            <th className="text-right px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Ngày Thêm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="5" className="px-8 py-8 text-center text-sm text-stone-500 italic">Chưa có nội dung nào.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
