import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="w-full mt-20 bg-[#0E0E0E] border-t border-[#353534]/30">
            <div className="max-w-7xl mx-auto px-12 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <span className="text-lg font-bold text-[#E50914] block mb-6">RimCinema</span>
                    <p className="font-['Inter'] text-xs text-gray-500 leading-relaxed">Điểm đến tuyệt vời cho trải nghiệm điện ảnh đỉnh cao. Thưởng thức phim theo cách tốt nhất.</p>
                </div>
                <div>
                    <h5 className="text-white text-sm font-bold mb-4">Khám Phá</h5>
                    <ul className="space-y-2">
                        <li><Link className="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors" to="/search">Phim Bộ</Link></li>
                        <li><Link className="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors" to="/search">Phim Lẻ</Link></li>
                        <li><Link className="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors" to="/search">Phim Gốc</Link></li>
                    </ul>
                </div>
                <div>
                    <h5 className="text-white text-sm font-bold mb-4">Hỗ Trợ</h5>
                    <ul className="space-y-2">
                        <li><a className="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors" href="#">Trung Tâm Trợ Giúp</a></li>
                        <li><a className="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors" href="#">Điều Khoản Sử Dụng</a></li>
                        <li><a className="font-['Inter'] text-xs text-gray-600 hover:text-white transition-colors" href="#">Chính Sách Bảo Mật</a></li>
                    </ul>
                </div>
                <div className="flex flex-col items-end justify-between">
                    <div className="flex gap-4">
                        <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-primary transition-colors">social_leaderboard</span>
                        <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-primary transition-colors">account_circle</span>
                        <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-primary transition-colors">share</span>
                    </div>
                    <p className="font-['Inter'] text-xs text-gray-500 mt-12">© 2024 RimCinema. Mọi quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    )
}
