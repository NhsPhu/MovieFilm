import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        adminService.getUsers().then(data => setUsers(data.content || data || [])).catch(() => setUsers([]))
    }, [])

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tighter">Quản Lý Người Dùng</h1>
                    <p className="text-stone-500 text-xs md:text-sm mt-1">Quản lý người dùng và quyền truy cập.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-manrope font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-container/20 w-full md:w-auto">
                    <span className="material-symbols-outlined text-sm">person_add</span> Thêm Người Dùng
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {label:'Tổng Người Dùng', val: users.length, icon:'group', color:'bg-primary-container/10 text-primary'},
                    {label:'Hoạt Động', val: users.filter(u => u.status === 'Active').length, icon:'check_circle', color:'bg-green-500/10 text-green-400'},
                    {label:'Đình Chỉ', val: users.filter(u => u.status === 'Suspended').length, icon:'block', color:'bg-red-500/10 text-red-400'}
                ].map((s,i) => (
                    <div key={i} className="glass-card p-6 rounded-xl border border-outline-variant/10">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined">{s.icon}</span>
                            </div>
                            <div>
                                <p className="text-2xl font-headline font-extrabold">{s.val}</p>
                                <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Bulk Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:flex-1 md:max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-500">search</span>
                    <input className="w-full bg-surface-container-lowest border-none focus:ring-0 text-sm py-3 pl-12 pr-4 rounded-xl border-b-2 border-transparent focus:border-primary transition-all" placeholder="Tìm kiếm người dùng..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold text-stone-400 border border-outline-variant/20 rounded-lg hover:bg-surface-container-high transition-all">Xuất</button>
                    <select className="flex-1 md:flex-none bg-surface-container-lowest border border-outline-variant/20 text-sm text-stone-400 rounded-lg px-4 py-2.5 focus:ring-0 focus:border-primary">
                        <option>Tất Cả Vai Trò</option>
                        <option>Quản Trị</option>
                        <option>Người Dùng</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-xl border border-outline-variant/10 overflow-x-auto w-full">
                <table className="w-full min-w-[800px]">
                    <thead className="border-b border-outline-variant/10">
                        <tr>
                            <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Người Dùng</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Email</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Vai Trò</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Trạng Thái</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Ngày Tham Gia</th>
                            <th className="text-right px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map(user => (
                            <tr key={user.id} className="border-b border-outline-variant/5 hover:bg-surface-container-high/30 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">{user.username?.[0]?.toUpperCase()}</div>
                                        <span className="font-bold text-sm">{user.username}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-stone-400">{user.email}</td>
                                <td className="px-4 py-4">
                                    <span className={user.role === 'ADMIN' ? "px-2 py-1 text-[10px] font-bold rounded-full bg-primary-container/20 text-primary" : "px-2 py-1 text-[10px] font-bold rounded-full bg-surface-container-high text-stone-400"}>{user.role}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={user.status === 'Active' ? "px-2 py-1 text-[10px] font-bold rounded-full bg-green-500/10 text-green-400" : "px-2 py-1 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400"}>{user.status || 'Active'}</span>
                                </td>
                                <td className="px-4 py-4 text-sm text-stone-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-8 py-4 text-right">
                                    <button className="text-stone-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">more_horiz</span></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
