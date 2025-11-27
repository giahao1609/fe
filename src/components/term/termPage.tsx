export default function TermsPage() {
  const Section = ({ id, title, children }:any) => (
    <section id={id} className="scroll-mt-20">
      <h2 className="mt-10 text-xl font-bold text-gray-900">{title}</h2>
      <div className="prose prose-sm mt-3 max-w-none text-gray-700 prose-a:text-rose-700">
        {children}
      </div>
    </section>
  );

  return (
    <main className="relative min-h-[calc(100vh-120px)] bg-[radial-gradient(1200px_600px_at_80%_-10%,#ffe7e6_0%,transparent_60%),radial-gradient(900px_500px_at_0%_110%,#fff3cd_0%,transparent_60%)]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-50 via-white to-amber-50" />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-600 text-white shadow-md">
            <span className="text-2xl">📜</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            Điều khoản sử dụng Food<span className="text-rose-600">Tour</span>
          </h1>
        </header>

        {/* TOC */}
        <nav className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Mục lục</p>
          <ol className="grid gap-2 text-sm text-gray-800 sm:grid-cols-2">
            <li><a href="#acceptance" className="hover:underline">1. Chấp nhận điều khoản</a></li>
            <li><a href="#account" className="hover:underline">2. Tài khoản & bảo mật</a></li>
            <li><a href="#content" className="hover:underline">3. Nội dung người dùng</a></li>
            <li><a href="#orders" className="hover:underline">4. Đặt bàn, đơn hàng & thanh toán</a></li>
            <li><a href="#promotions" className="hover:underline">5. Mã ưu đãi & chương trình khuyến mãi</a></li>
            <li><a href="#reviews" className="hover:underline">6. Đánh giá & xếp hạng</a></li>
            <li><a href="#privacy" className="hover:underline">7. Quyền riêng tư & bảo vệ dữ liệu</a></li>
            <li><a href="#liability" className="hover:underline">8. Trách nhiệm & miễn trừ</a></li>
            <li><a href="#changes" className="hover:underline">9. Thay đổi điều khoản</a></li>
            <li><a href="#contact" className="hover:underline">10. Liên hệ</a></li>
          </ol>
        </nav>

        {/* Sections */}
        <Section id="acceptance" title="1. Chấp nhận điều khoản">
          <p>Khi truy cập hoặc sử dụng ứng dụng/dịch vụ FoodTour, bạn đồng ý bị ràng buộc bởi các Điều khoản sử dụng này và các chính sách liên quan (ví dụ: Chính sách bảo mật). Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ.</p>
        </Section>

        <Section id="account" title="2. Tài khoản & bảo mật">
          <ul>
            <li>Bạn phải đủ 18 tuổi hoặc có sự đồng ý hợp pháp từ người giám hộ.</li>
            <li>Thông tin đăng ký phải chính xác, được cập nhật; bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập.</li>
            <li>Bạn phải thông báo ngay cho chúng tôi nếu phát hiện sử dụng trái phép hoặc nghi ngờ vi phạm bảo mật.</li>
            <li>Chúng tôi có thể tạm ngưng/ chấm dứt tài khoản khi phát hiện hành vi gian lận, lạm dụng hoặc vi phạm điều khoản.</li>
          </ul>
        </Section>

        <Section id="content" title="3. Nội dung người dùng">
          <ul>
            <li>Bạn giữ quyền sở hữu đối với nội dung do bạn tạo (đánh giá, ảnh, bình luận), nhưng cấp cho FoodTour giấy phép toàn cầu, không độc quyền để sử dụng nhằm vận hành và cải thiện dịch vụ.</li>
            <li>Không đăng nội dung trái pháp luật, vi phạm bản quyền, thù hằn, khiêu dâm, spam hoặc xâm phạm quyền riêng tư của người khác.</li>
            <li>FoodTour có quyền ẩn/xoá nội dung vi phạm theo quyết định hợp lý.</li>
          </ul>
        </Section>

        <Section id="orders" title="4. Đặt bàn, đơn hàng & thanh toán">
          <ul>
            <li>Giá, phí và thời gian dự kiến do đối tác cung cấp; có thể thay đổi tùy thời điểm và khu vực.</li>
            <li>Đơn đã xác nhận có thể không hủy hoặc phát sinh phí hủy theo chính sách từng đối tác.</li>
            <li>Thanh toán bằng thẻ/ ví điện tử do bên thứ ba xử lý; có thể yêu cầu xác minh thêm để chống gian lận.</li>
            <li>Hoàn tiền (nếu có) sẽ tuân theo điều kiện và thời hạn của phương thức thanh toán/đối tác.</li>
          </ul>
        </Section>

        <Section id="promotions" title="5. Mã ưu đãi & chương trình khuyến mãi">
          <ul>
            <li>Mỗi mã có điều kiện riêng (thời gian, khu vực, giá trị đơn tối thiểu, đối tác áp dụng...).</li>
            <li>Mã không có giá trị tiền mặt, không được mua bán, chuyển nhượng, hoặc quy đổi.</li>
            <li>FoodTour có quyền thay đổi/huỷ chương trình nếu phát hiện sử dụng sai mục đích hoặc gian lận.</li>
          </ul>
        </Section>

        <Section id="reviews" title="6. Đánh giá & xếp hạng">
          <ul>
            <li>Đánh giá phải dựa trên trải nghiệm thực và tuân thủ tiêu chuẩn cộng đồng.</li>
            <li>Cấm kích động, lôi kéo đánh giá giả; vi phạm có thể dẫn tới chặn hiển thị, khoá tài khoản.</li>
          </ul>
        </Section>

        <Section id="privacy" title="7. Quyền riêng tư & bảo vệ dữ liệu">
          <p>Việc thu thập và xử lý dữ liệu cá nhân tuân thủ Chính sách bảo mật của FoodTour. Bạn có quyền truy cập, chỉnh sửa, yêu cầu xoá hoặc hạn chế xử lý dữ liệu theo quy định pháp luật hiện hành.</p>
        </Section>

        <Section id="liability" title="8. Trách nhiệm & miễn trừ">
          <ul>
            <li>Dịch vụ được cung cấp "nguyên trạng" trong phạm vi pháp luật cho phép. FoodTour không chịu trách nhiệm cho thiệt hại gián tiếp, đặc biệt hoặc hệ quả phát sinh do việc sử dụng dịch vụ.</li>
            <li>Trong mọi trường hợp, tổng mức bồi thường (nếu có) sẽ không vượt quá số tiền bạn đã thanh toán trong 6 tháng gần nhất cho dịch vụ liên quan.</li>
          </ul>
        </Section>

        <Section id="changes" title="9. Thay đổi điều khoản">
          <p>Chúng tôi có thể cập nhật Điều khoản định kỳ. Khi thay đổi đáng kể, chúng tôi sẽ thông báo qua email, thông báo trong ứng dụng hoặc trên trang web. Việc bạn tiếp tục sử dụng dịch vụ sau thời điểm hiệu lực đồng nghĩa với việc chấp nhận các thay đổi.</p>
        </Section>

        <Section id="contact" title="10. Liên hệ">
          <p>Nếu có câu hỏi về Điều khoản, vui lòng liên hệ: <a href="mailto:support@foodtour.example">support@foodtour.example</a> hoặc số điện thoại CSKH 24/7: 1900 0000.</p>
        </Section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-500">
          <a href="/" className="hover:underline">← Về trang chủ</a>
          <p className="mt-2">© {new Date().getFullYear()} FoodTour. Tất cả các quyền được bảo lưu.</p>
        </footer>
      </div>
    </main>
  );
}


