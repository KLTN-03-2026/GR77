"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PoliciesPage() {
    const [activeSection, setActiveSection] = useState("privacy");
    const [isEmailOpen, setIsEmailOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(id);
        }
    };

    // Update active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["privacy", "terms", "contact"];
            let current = "privacy";
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // if the top of the section is somewhat near the top of the viewport
                    if (rect.top <= 200) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };
        window.addEventListener("scroll", handleScroll);
        // Trigger once on mount
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="policies-page relative min-h-screen">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                .policies-page * {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                @keyframes gradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-14px); }
                }
                @keyframes pulseRing {
                  0% { transform: scale(0.92); opacity: 0.5; }
                  50% { transform: scale(1.05); opacity: 0.2; }
                  100% { transform: scale(0.92); opacity: 0.5; }
                }

                .anim-gradient-bg {
                  background-size: 200% 200%;
                  animation: gradientShift 8s ease infinite;
                }
                .anim-float { animation: float 6s ease-in-out infinite; }
                .anim-pulse-ring { animation: pulseRing 4s ease-in-out infinite; }

                .policies-page ::-webkit-scrollbar {
                    width: 8px;
                }
                .policies-page ::-webkit-scrollbar-track {
                    background: transparent;
                }
                .policies-page ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 4px;
                }
                .policies-page ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.6);
                }
                
                .glass-panel {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                }
            `}</style>
            
            {/* Background identical to register page */}
            <div
                className="fixed inset-0 anim-gradient-bg -z-10"
                style={{
                    background: "linear-gradient(135deg, #0097d9 0%, #00AEEF 25%, #33c1f5 50%, #00AEEF 75%, #007bb5 100%)",
                }}
            />

            {/* Background animated elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[8%] left-[6%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 anim-float" />
                <div className="absolute bottom-[12%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/8 anim-float" style={{ animationDelay: "1s" }} />
                <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-white/10 anim-pulse-ring" />
                {/* Additional decorators for a longer page */}
                <div className="absolute top-[30%] right-[10%] w-40 h-40 rounded-full bg-white/5 anim-float" style={{ animationDelay: "2s" }} />
                <div className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full border border-white/5 anim-pulse-ring" style={{ animationDelay: "1.5s" }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative z-10 flex flex-col md:flex-row gap-8 items-start">
                
                {/* Navigation Sidebar */}
                <div className="w-full md:w-1/4 md:sticky md:top-8 glass-panel rounded-2xl p-6 hidden md:block">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors group text-sm font-semibold">
                        <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Trở về trang chủ
                    </Link>

                    <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Mục lục</h3>
                    <nav className="space-y-4">
                        <button 
                            onClick={() => scrollToSection('privacy')}
                            className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'privacy' ? 'bg-white text-[#00AEEF] font-bold shadow-md scale-[1.02]' : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'}`}
                        >
                            Quyền Riêng Tư
                        </button>
                        <button 
                            onClick={() => scrollToSection('terms')}
                            className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'terms' ? 'bg-white text-[#00AEEF] font-bold shadow-md scale-[1.02]' : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'}`}
                        >
                            Điều Khoản Sử Dụng
                        </button>
                        <button 
                            onClick={() => scrollToSection('contact')}
                            className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${activeSection === 'contact' ? 'bg-white text-[#00AEEF] font-bold shadow-md scale-[1.02]' : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'}`}
                        >
                            Liên Hệ
                        </button>
                    </nav>
                </div>

                {/* Mobile Navigation */}
                <div className="w-full md:hidden glass-panel rounded-2xl p-3 sticky top-4 z-50">
                     <div className="flex justify-between items-center overflow-x-auto gap-2 pb-1 scrollbar-none">
                        <button 
                            onClick={() => scrollToSection('privacy')}
                            className={`whitespace-nowrap px-4 py-2 text-sm rounded-xl transition-all flex-1 text-center ${activeSection === 'privacy' ? 'bg-white text-[#00AEEF] font-bold shadow-md' : 'text-white hover:bg-white/10'}`}
                        >
                            Quyền Riêng Tư
                        </button>
                        <button 
                            onClick={() => scrollToSection('terms')}
                            className={`whitespace-nowrap px-4 py-2 text-sm rounded-xl transition-all flex-1 text-center ${activeSection === 'terms' ? 'bg-white text-[#00AEEF] font-bold shadow-md' : 'text-white hover:bg-white/10'}`}
                        >
                            Điều Khoản
                        </button>
                        <button 
                            onClick={() => scrollToSection('contact')}
                            className={`whitespace-nowrap px-4 py-2 text-sm rounded-xl transition-all flex-1 text-center ${activeSection === 'contact' ? 'bg-white text-[#00AEEF] font-bold shadow-md' : 'text-white hover:bg-white/10'}`}
                        >
                            Liên Hệ
                        </button>
                     </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-3/4 space-y-8">
                    {/* Header */}
                    <div className="text-center mb-10 pt-4 md:pt-0">
                        <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-white/25 bg-white/15 backdrop-blur-sm text-white mb-6">
                            Kindlink Policies
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">
                            Điều Khoản & Chính Sách
                        </h1>
                        <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto font-medium">
                            Vui lòng đọc kỹ các chính sách và điều khoản của chúng tôi trước khi sử dụng hệ thống.
                        </p>
                    </div>

                    {/* Section: Privacy */}
                    <section id="privacy" className="glass-panel rounded-3xl p-6 md:p-10 text-white scroll-mt-28 transition-all hover:bg-white/20">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/20">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center transform rotate-3">
                                <span className="text-2xl drop-shadow-md">🔐</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">CHÍNH SÁCH QUYỀN RIÊNG TƯ</h2>
                        </div>
                        
                        <div className="space-y-8 text-white/95 leading-relaxed font-medium">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span> Mục đích</h3>
                                <p className="ml-8">Chính sách này giải thích cách Kindlink thu thập, sử dụng và bảo vệ thông tin cá nhân của người dùng khi sử dụng hệ thống.</p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span> Thông tin chúng tôi thu thập</h3>
                                <p className="mb-3 ml-8">Chúng tôi có thể thu thập các thông tin sau:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Email, tên người dùng</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Mật khẩu (được mã hóa, không lưu dạng văn bản thuần)</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Thông tin hồ sơ (nếu người dùng cung cấp)</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Lịch sử hoạt động: quyên góp, tham gia chiến dịch, tương tác</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Thông tin kỹ thuật: địa chỉ IP, thiết bị, trình duyệt</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span> Mục đích sử dụng thông tin</h3>
                                <p className="mb-3 ml-8">Thông tin được sử dụng để:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Tạo và quản lý tài khoản</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Xác thực người dùng và đảm bảo bảo mật</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Hiển thị lịch sử hoạt động và cá nhân hóa trải nghiệm</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Hỗ trợ giao dịch quyên góp</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Cải thiện chất lượng hệ thống</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">4</span> Chia sẻ thông tin</h3>
                                <p className="mb-3 ml-8">Chúng tôi không bán thông tin cá nhân của người dùng.<br />Thông tin có thể được chia sẻ với:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Nhà cung cấp dịch vụ thanh toán (VNPay, MoMo, PayOS)</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Dịch vụ gửi email (xác thực, thông báo)</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Cơ quan có thẩm quyền khi có yêu cầu hợp pháp</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">5</span> Bảo mật dữ liệu</h3>
                                <p className="mb-3 ml-8">Chúng tôi áp dụng các biện pháp bảo mật như:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Mã hóa mật khẩu</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Xác thực bằng token (JWT)</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Hạn chế truy cập dữ liệu nội bộ</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">6</span> Quyền của người dùng</h3>
                                <p className="mb-3 ml-8">Người dùng có quyền:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Xem và cập nhật thông tin cá nhân</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Yêu cầu hỗ trợ hoặc xóa tài khoản (nếu phù hợp)</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Từ chối nhận thông báo từ hệ thống</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">7</span> Lưu trữ dữ liệu</h3>
                                <p className="ml-8">Dữ liệu được lưu trữ trong thời gian cần thiết để phục vụ hoạt động hệ thống hoặc theo yêu cầu pháp luật.</p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">8</span> Cookie và theo dõi</h3>
                                <p className="mb-3 ml-8">Hệ thống có thể sử dụng cookie hoặc công nghệ tương tự để:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Duy trì phiên đăng nhập</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Ghi nhớ tùy chọn người dùng</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">9</span> Thay đổi chính sách</h3>
                                <p className="ml-8">Chính sách có thể được cập nhật theo thời gian.<br />Người dùng sẽ được thông báo khi có thay đổi quan trọng.</p>
                            </div>
                        </div>
                    </section>


                    {/* Section: Terms */}
                    <section id="terms" className="glass-panel rounded-3xl p-6 md:p-10 text-white scroll-mt-28 transition-all hover:bg-white/20">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/20">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center transform -rotate-3">
                                <span className="text-2xl drop-shadow-md">📄</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">ĐIỀU KHOẢN SỬ DỤNG</h2>
                        </div>
                        
                        <div className="space-y-8 text-white/95 leading-relaxed font-medium">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span> Giới thiệu</h3>
                                <p className="ml-8">Kindlink là nền tảng kết nối người dùng với các chiến dịch quyên góp.<br/>Khi sử dụng hệ thống, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span> Vai trò của hệ thống</h3>
                                <p className="mb-3 ml-8">Kindlink là nền tảng trung gian kết nối, không phải tổ chức tài chính.<br/>Hệ thống:</p>
                                <ul className="list-none space-y-2 ml-8 mb-3">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Không giữ tiền của người dùng</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Không trực tiếp xử lý giao dịch tài chính</li>
                                </ul>
                                <p className="ml-8 text-sm opacity-80 italic">Mọi giao dịch được thực hiện thông qua bên thứ ba hoặc ví cá nhân của người dùng.</p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span> Tài khoản người dùng</h3>
                                <p className="mb-3 ml-8">Người dùng có trách nhiệm:</p>
                                <ul className="list-none space-y-2 ml-8 mb-3">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Cung cấp thông tin chính xác khi đăng ký</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Bảo mật tài khoản và mật khẩu</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Không chia sẻ tài khoản cho người khác</li>
                                </ul>
                                <p className="ml-8 text-sm opacity-80 italic">Kindlink có quyền tạm khóa hoặc xóa tài khoản vi phạm.</p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">4</span> Chiến dịch quyên góp</h3>
                                <p className="mb-3 ml-8">Người tạo chiến dịch phải:</p>
                                <ul className="list-none space-y-2 ml-8 mb-4">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Cung cấp thông tin trung thực, rõ ràng</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Chịu trách nhiệm về nội dung và tính hợp pháp</li>
                                </ul>
                                <p className="mb-3 ml-8">Kindlink có quyền:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Kiểm duyệt, từ chối hoặc gỡ bỏ chiến dịch</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Tạm dừng chiến dịch nếu phát hiện vi phạm</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">5</span> Quyên góp và giao dịch</h3>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Người dùng cần đăng nhập để thực hiện quyên góp</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Giao dịch được thực hiện qua bên thứ ba (VNPay, MoMo, PayOS…) hoặc ví blockchain</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Kindlink chỉ lưu trữ thông tin giao dịch phục vụ hiển thị và quản lý</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">6</span> Hành vi bị cấm</h3>
                                <p className="mb-3 ml-8">Người dùng không được:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Đăng tải nội dung sai sự thật, lừa đảo</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Lợi dụng hệ thống để trục lợi</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Gây ảnh hưởng đến hoạt động của hệ thống</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">7</span> Giới hạn trách nhiệm</h3>
                                <p className="mb-3 ml-8">Kindlink không chịu trách nhiệm đối với:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Tranh chấp giữa người dùng</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Thiệt hại phát sinh từ giao dịch tài chính</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Nội dung do người dùng đăng tải</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">8</span> Thay đổi và chấm dứt dịch vụ</h3>
                                <p className="mb-3 ml-8">Kindlink có thể:</p>
                                <ul className="list-none space-y-2 ml-8">
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Cập nhật, thay đổi hệ thống hoặc điều khoản</li>
                                    <li className="flex items-start gap-2"><span className="text-white mt-1">•</span> Tạm ngừng hoặc chấm dứt dịch vụ khi cần thiết</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><span className="text-[#00AEEF] bg-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">9</span> Hiệu lực</h3>
                                <p className="ml-8">Các điều khoản này có hiệu lực kể từ khi người dùng sử dụng hệ thống.</p>
                            </div>
                        </div>
                    </section>


                    {/* Section: Contact */}
                    <section id="contact" className="glass-panel rounded-3xl p-6 md:p-10 text-white scroll-mt-28 transition-all hover:bg-white/20">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/20">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-2xl drop-shadow-md">📧</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">LIÊN HỆ</h2>
                        </div>
                        
                        <div className="space-y-6 text-white/95 leading-relaxed font-medium">
                            <p className="text-lg">Nếu có câu hỏi, vui lòng liên hệ đội ngũ phát triển:</p>
                            
                            <div className="mt-6">
                                <button 
                                    onClick={() => setIsEmailOpen(!isEmailOpen)}
                                    className="flex items-center justify-between gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl transition-all duration-300 w-full sm:max-w-md shadow-sm"
                                >
                                    <span className="font-bold text-white tracking-wide">Danh sách Email Hỗ trợ</span>
                                    <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transform transition-transform duration-500 ease-in-out ${isEmailOpen ? 'rotate-180 bg-[#00AEEF]/80' : ''}`}>
                                        <svg 
                                            className="w-5 h-5 text-white" 
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>
                                
                                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] sm:max-w-md ${isEmailOpen ? 'max-h-96 opacity-100 mt-4 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}>
                                    <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md shadow-lg">
                                        <ul className="space-y-4">
                                            {[
                                                "dothingoctienma1@gmail.com",
                                                "tramyvlqt@gmail.com",
                                                "anhuemdt@gmail.com",
                                                "hn8221749@gmail.com",
                                                "vuong.7.2.2k4@gmail.com"
                                            ].map((email, i) => (
                                                <li key={i} className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#00AEEF] group-hover:scale-110 transition-all duration-300 shadow-sm border border-white/10">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <a href={`mailto:${email}`} className="text-[15px] font-semibold tracking-wide hover:text-[#00AEEF] transition-colors duration-200 decoration-[#00AEEF]/50 hover:underline underline-offset-4">
                                                        {email}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
