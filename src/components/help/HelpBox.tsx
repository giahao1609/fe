export default function HelpCenterPage() {
  const Icon = ({ path, size = 18, className = "" }:any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );

  const categories = [
    {
      title: "Tài khoản & hồ sơ",
      desc: "Đăng ký, đăng nhập, bảo mật, thông báo",
      icon: (
        <Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
      ),
      links: ["Đổi email/điện thoại", "Đăng nhập Google/Apple", "Khôi phục mật khẩu"],
    },
    {
      title: "Đặt bàn & đơn hàng",
      desc: "Tạo, thay đổi, hủy; theo dõi trạng thái",
      icon: (
        <Icon path={<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></>} />
      ),
      links: ["Theo dõi đơn", "Sửa thời gian nhận", "Hủy đặt bàn"],
    },
    {
      title: "Thanh toán & ưu đãi",
      desc: "Thẻ, ví điện tử, hoá đơn, mã khuyến mãi",
      icon: (
        <Icon path={<><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>} />
      ),
      links: ["Áp mã giảm giá", "Hoàn tiền thất bại", "Xuất hoá đơn VAT"],
    },
    {
      title: "Đánh giá & gợi ý",
      desc: "Viết review, đánh dấu quán, cá nhân hoá",
      icon: (
        <Icon path={<><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" /></>} />
      ),
      links: ["Sửa/xoá đánh giá", "Lưu quán yêu thích", "Tuỳ chỉnh khẩu vị"],
    },
    {
      title: "Bảo mật & quyền riêng tư",
      desc: "2FA, quyền dữ liệu, báo cáo xâm phạm",
      icon: (
        <Icon path={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>} />
      ),
      links: ["Bật xác thực 2 bước", "Tải dữ liệu của tôi", "Báo cáo xâm phạm"],
    },
    {
      title: "Đối tác nhà hàng",
      desc: "Tham gia FoodTour, quản lý quán",
      icon: (
        <Icon path={<><path d="M18 8a6 6 0 0 0-12 0" /><path d="M2 8h20" /><path d="M20 8v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8" /><line x1="12" y1="12" x2="12" y2="14" /></>} />
      ),
      links: ["Đăng ký đối tác", "Quản lý menu", "Chương trình ưu đãi"],
    },
  ];

  const popular = [
    { title: "Cách xác minh email và bảo vệ tài khoản", tag: "Tài khoản" },
    { title: "Áp mã giảm giá khi thanh toán", tag: "Thanh toán" },
    { title: "Theo dõi đơn ăn uống ngoài trời", tag: "Đơn hàng" },
    { title: "Gợi ý quán theo khẩu vị hoạt động thế nào?", tag: "Tính năng" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-120px)] bg-[radial-gradient(1200px_600px_at_80%_-10%,#ffe7e6_0%,transparent_60%),radial-gradient(900px_500px_at_0%_110%,#fff3cd_0%,transparent_60%)]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-50 via-white to-amber-50" />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-600 text-white shadow-md">
            <span className="text-2xl">🍜</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Food<span className="text-rose-600">Tour</span> — Trung tâm trợ giúp
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tìm câu trả lời nhanh, xử lý sự cố, hoặc liên hệ đội ngũ hỗ trợ 24/7.
          </p>

         
        </div>

        {/* Categories */}
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3 pb-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-700">
                  {c.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </div>
              <ul className="list-inside list-disc space-y-1 pl-1 text-sm text-gray-700">
                {c.links.map((l) => (
                  <li key={l}>
                    <button className="rounded-md p-1 text-left underline-offset-2 hover:underline">{l}</button>
                  </li>
                ))}
              </ul>
            
            </div>
          ))}
        </div>

       
        <section className="mt-10 w-full">
          <h2 className="mb-3 text-xl font-bold">Câu hỏi thường gặp</h2>
          <div className="rounded-2xl bg-white/70 p-2 shadow-sm backdrop-blur">
            <details className="group border-b p-4 last:border-none open:bg-white/60">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left text-sm font-medium">
                <span>Tôi quên mật khẩu, làm sao để đặt lại?</span>
                <span className="transition group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                Vào <strong>Tài khoản → Bảo mật</strong> và chọn <em>Khôi phục mật khẩu</em>. Nhập email/điện thoại đã đăng ký để nhận mã xác minh, sau đó đặt mật khẩu mới.
              </p>
            </details>
            <details className="group border-b p-4 last:border-none open:bg-white/60">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left text-sm font-medium">
                <span>Tôi không áp được mã giảm giá?</span>
                <span className="transition group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                Kiểm tra điều kiện của mã (thời gian, khu vực, giá trị tối thiểu). Nếu vẫn không được, chụp màn hình và gửi email cho chúng tôi để hỗ trợ.
              </p>
            </details>
            <details className="group border-b p-4 last:border-none open:bg-white/60">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left text-sm font-medium">
                <span>Làm sao để theo dõi đơn hàng?</span>
                <span className="transition group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                Vào <strong>Đơn hàng của tôi</strong>, chọn đơn gần nhất để xem trạng thái theo thời gian thực và vị trí tài xế (nếu có).
              </p>
            </details>
            <details className="group p-4 open:bg-white/60">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left text-sm font-medium">
                <span>FoodTour gợi ý quán dựa trên tiêu chí nào?</span>
                <span className="transition group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-sm text-gray-700">
                Dựa trên vị trí, lịch sử tương tác, đánh dấu yêu thích và thiết lập khẩu vị (cay/ăn chay/không hải sản...). Bạn có thể tuỳ chỉnh tại <strong>Cài đặt khẩu vị</strong>.
              </p>
            </details>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10 w-full">
          <div className="rounded-2xl bg-gradient-to-r from-rose-100 to-amber-100 p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <h3 className="text-lg font-bold">Cần thêm trợ giúp?</h3>
                <p className="text-sm text-gray-700">Đội ngũ CSKH của FoodTour sẵn sàng hỗ trợ 24/7 qua chat, email hoặc điện thoại.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-50">✉️ Gửi email</button>
                <button className="rounded-xl border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">📞 Gọi nóng</button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 w-full text-center text-xs text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a className="hover:underline" href="#">Chính sách riêng tư</a>
            <span>•</span>
            <a className="hover:underline" href="#">Điều khoản sử dụng</a>
            <span>•</span>
            <a className="hover:underline" href="#">Trung tâm an toàn</a>
          </div>
          <p className="mt-2">© {new Date().getFullYear()} FoodTour. Tất cả các quyền được bảo lưu.</p>
        </footer>
      </div>
    </div>
  );
}