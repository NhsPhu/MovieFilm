export default function AdminAnalyticsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-extrabold tracking-tighter">Phân Tích & Báo Cáo</h1>
                    <p className="text-stone-500 text-sm mt-1">Thông tin chi tiết về hiệu suất nền tảng.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 text-xs font-bold text-stone-400 border border-outline-variant/20 rounded-lg hover:bg-surface-container-high transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">download</span> Xuất Báo Cáo
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {label:'Tổng Doanh Thu', val:'—', trend:'', icon:'payments', color:'bg-primary-container/10 text-primary'},
                    {label:'Đăng Ký', val:'—', trend:'', icon:'card_membership', color:'bg-tertiary-container/10 text-tertiary'},
                    {label:'TG Xem TB', val:'—', trend:'', icon:'schedule', color:'bg-secondary-container/10 text-secondary'},
                    {label:'Tỉ Lệ Rời', val:'—', trend:'', icon:'trending_down', color:'bg-green-500/10 text-green-400'}
                ].map((s,i) => (
                    <div key={i} className="glass-card p-6 rounded-xl border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined">{s.icon}</span>
                            </div>
                            {s.trend && <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.trend.startsWith('+') ? 'text-green-400 bg-green-400/10' : s.trend.startsWith('-') ? 'text-green-400 bg-green-400/10' : 'text-stone-400 bg-stone-400/10'}`}>{s.trend}</span>}
                        </div>
                        <p className="text-3xl font-headline font-extrabold tracking-tight">{s.val}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-widest mt-1 font-bold">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Viewership Trend */}
                <div className="glass-card p-8 rounded-xl border border-outline-variant/10">
                    <h3 className="text-xl font-headline font-bold mb-6">Xu Hướng Lượt Xem</h3>
                    <div className="h-64 flex items-end justify-between gap-3 px-4">
                        {[35,50,40,70,45,80,55,90,65,75,85,95].map((h,i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full rounded-t-lg bg-gradient-to-t from-primary-container/50 to-primary/20 hover:from-primary-container hover:to-primary transition-all duration-300 cursor-pointer" style={{height: `${h}%`}}></div>
                                <span className="text-[9px] text-stone-600">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Genre Distribution */}
                <div className="glass-card p-8 rounded-xl border border-outline-variant/10">
                    <h3 className="text-xl font-headline font-bold mb-6">Phân Bố Thể Loại</h3>
                    <div className="flex flex-col gap-4">
                        {[
                            {genre:'Action',pct:35,color:'bg-primary-container'},
                            {genre:'Sci-Fi',pct:25,color:'bg-tertiary-container'},
                            {genre:'Drama',pct:20,color:'bg-secondary-container'},
                            {genre:'Comedy',pct:12,color:'bg-yellow-500'},
                            {genre:'Horror',pct:8,color:'bg-red-500'}
                        ].map((g,i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">{g.genre}</span>
                                    <span className="text-stone-400">{g.pct}%</span>
                                </div>
                                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                                    <div className={`h-full ${g.color} rounded-full transition-all duration-700`} style={{width: `${g.pct}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Content Table */}
            <div className="glass-card rounded-xl border border-outline-variant/10 overflow-hidden">
                <div className="px-8 py-6 border-b border-outline-variant/10">
                    <h3 className="text-xl font-headline font-bold">Nội Dung Nổi Bật Nhất</h3>
                </div>
                <table className="w-full">
                    <thead className="border-b border-outline-variant/10">
                        <tr>
                            <th className="text-left px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">#</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Tiêu Đề</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Lượt Xem</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">TG Xem TB</th>
                            <th className="text-left px-4 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Đánh Giá</th>
                            <th className="text-right px-8 py-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">Doanh Thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                        ].length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-8 py-8 text-center text-sm text-stone-500 italic">Chưa có dữ liệu.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
