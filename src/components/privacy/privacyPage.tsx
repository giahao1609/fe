export const PrivacyPageView = () => {
  const today = new Date();
  const lastUpdated = `${String(today.getDate()).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${today.getFullYear()}`;

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
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            Chính sách bảo mật Food<span className="text-rose-600">Tour</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">Cập nhật lần cuối: {lastUpdated}</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
            Chính sách này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ dữ liệu cá nhân của bạn khi sử dụng FoodTour.
          </p>
        </header>

        {/* Quick notice */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Lưu ý nhanh:</strong> Bạn có thể gửi yêu cầu truy cập/xoá dữ liệu qua email
          <a className="ml-1 underline" href="mailto:privacy@foodtour.example">privacy@foodtour.example</a>.
        </div>

        {/* TL;DR */}
        <Section id="tldr" title="Tóm tắt nhanh (TL;DR)">
          <ul className="list-disc pl-5">
            <li>Chúng tôi thu thập thông tin tài khoản, thiết bị, vị trí gần đúng và lịch sử tương tác để cá nhân hoá trải nghiệm.</li>
            <li>Chúng tôi không bán dữ liệu cá nhân; chỉ chia sẻ với nhà cung cấp dịch vụ theo hợp đồng hoặc khi pháp luật yêu cầu.</li>
            <li>Bạn có quyền truy cập, chỉnh sửa, xoá, hạn chế xử lý và rút lại sự đồng ý (nếu áp dụng).</li>
          </ul>
        </Section>

        {/* Data we collect */}
        <Section id="collect" title="1. Dữ liệu chúng tôi thu thập">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
              <div className="col-span-4">Loại dữ liệu</div>
              <div className="col-span-5">Ví dụ</div>
              <div className="col-span-3">Cơ sở pháp lý*</div>
            </div>
            {[
              {
                k: "Thông tin tài khoản",
                v: "Tên, email, số điện thoại, ảnh đại diện, thiết lập khẩu vị",
                b: "Thực hiện hợp đồng; Lợi ích hợp pháp",
              },
              {
                k: "Dữ liệu giao dịch",
                v: "Đơn đặt, lịch sử thanh toán (ẩn số thẻ), mã ưu đãi",
                b: "Thực hiện hợp đồng; Nghĩa vụ pháp lý",
              },
              {
                k: "Dữ liệu thiết bị",
                v: "IP, loại trình duyệt, nhận dạng thiết bị, cookie",
                b: "Lợi ích hợp pháp; Đồng ý (cookie tuỳ chọn)",
              },
              {
                k: "Vị trí gần đúng",
                v: "Vị trí để gợi ý quán gần bạn (không theo dõi nền khi không cần)",
                b: "Đồng ý",
              },
              {
                k: "Nội dung người dùng",
                v: "Đánh giá, ảnh, bình luận, bookmark",
                b: "Thực hiện hợp đồng; Lợi ích hợp pháp",
              },
            ].map((row) => (
              <div key={row.k} className="grid grid-cols-12 border-t px-4 py-3 text-sm">
                <div className="col-span-4 font-medium text-gray-900">{row.k}</div>
                <div className="col-span-5 text-gray-700">{row.v}</div>
                <div className="col-span-3 text-gray-600">{row.b}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">*Cơ sở pháp lý áp dụng theo luật bảo vệ dữ liệu hiện hành.</p>
        </Section>

        {/* How we use */}
        <Section id="use" title="2. Mục đích sử dụng dữ liệu">
          <ul className="list-disc pl-5">
            <li>Vận hành dịch vụ: tạo/duy trì tài khoản, xử lý đặt bàn/đơn hàng, thanh toán.</li>
            <li>Cá nhân hoá: gợi ý quán theo vị trí, khẩu vị và lịch sử tương tác.</li>
            <li>Bảo mật: phát hiện gian lận, lạm dụng; ghi log an toàn.</li>
            <li>Giao tiếp: gửi thông báo về đơn hàng, hỗ trợ khách hàng, cập nhật tính năng.</li>
            <li>Phân tích & cải tiến: thống kê dùng ẩn danh/giả danh hoá.</li>
          </ul>
        </Section>

        {/* Cookies */}
        <Section id="cookies" title="3. Cookie & công nghệ tương tự">
          <p>Chúng tôi dùng cookie thiết yếu để hoạt động trang và cookie tuỳ chọn (hiệu suất/marketing) khi bạn đồng ý. Bạn có thể quản lý trong phần Cài đặt cookie.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-sm">
              <p className="font-semibold">Cookie thiết yếu</p>
              <p>Đăng nhập, bảo mật, ghi nhớ tuỳ chọn cơ bản.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-sm">
              <p className="font-semibold">Hiệu suất & phân tích (tuỳ chọn)</p>
              <p>Đo lường sử dụng để cải thiện trải nghiệm.</p>
            </div>
          </div>
        </Section>

        {/* Sharing */}
        <Section id="sharing" title="4. Chia sẻ dữ liệu">
          <ul className="list-disc pl-5">
            <li>Nhà cung cấp dịch vụ (hạ tầng, thanh toán, phân phối email) theo hợp đồng và chỉ theo hướng dẫn của chúng tôi.</li>
            <li>Đối tác nhà hàng khi cần để thực hiện đơn/đặt bàn của bạn.</li>
            <li>Cơ quan quản lý khi pháp luật yêu cầu hoặc để bảo vệ quyền lợi hợp pháp.</li>
          </ul>
        </Section>

        {/* Rights */}
        <Section id="rights" title="5. Quyền của bạn">
          <ul className="list-disc pl-5">
            <li>Truy cập và nhận bản sao dữ liệu cá nhân.</li>
            <li>Chỉnh sửa, xoá; hạn chế hoặc phản đối xử lý trong một số trường hợp.</li>
            <li>Rút lại sự đồng ý bất cứ lúc nào (không ảnh hưởng tính hợp pháp đã thực hiện).</li>
            <li>Di chuyển dữ liệu (nếu áp dụng).</li>
          </ul>
          <p className="mt-2">Gửi yêu cầu tới <a href="mailto:privacy@foodtour.example">privacy@foodtour.example</a>. Chúng tôi có thể yêu cầu xác minh danh tính trước khi xử lý yêu cầu.</p>
        </Section>

        {/* Security */}
        <Section id="security" title="6. Bảo mật">
          <p>Chúng tôi áp dụng biện pháp kỹ thuật và tổ chức hợp lý (mã hoá, kiểm soát truy cập, ghi log) để bảo vệ dữ liệu. Tuy nhiên, không hệ thống nào an toàn tuyệt đối; bạn hãy dùng mật khẩu mạnh và bật 2FA.</p>
        </Section>

        {/* Retention */}
        <Section id="retention" title="7. Lưu trữ">
          <p>Chúng tôi lưu dữ liệu trong thời gian cần thiết cho mục đích nêu trên, trừ khi luật yêu cầu thời hạn dài hơn. Khi hết mục đích, dữ liệu sẽ được xoá hoặc ẩn danh hoá an toàn.</p>
        </Section>

        {/* Children */}
        <Section id="children" title="8. Trẻ vị thành niên">
          <p>Dịch vụ không dành cho trẻ em dưới 13 tuổi. Nếu phát hiện đã thu thập dữ liệu từ trẻ em mà không có sự đồng ý phù hợp, chúng tôi sẽ xoá kịp thời.</p>
        </Section>

        {/* International */}
        <Section id="transfer" title="9. Chuyển dữ liệu ra nước ngoài">
          <p>Dữ liệu có thể được xử lý ở các quốc gia khác. Chúng tôi đảm bảo cơ chế bảo vệ phù hợp (ví dụ: điều khoản hợp đồng mẫu) theo luật hiện hành.</p>
        </Section>

        {/* Changes */}
        <Section id="changes" title="10. Thay đổi chính sách">
          <p>Chúng tôi có thể cập nhật Chính sách này định kỳ. Thông báo sẽ được đăng trong ứng dụng hoặc gửi email khi có thay đổi quan trọng. Việc bạn tiếp tục sử dụng dịch vụ sau khi cập nhật đồng nghĩa với việc chấp nhận.</p>
        </Section>

        {/* Contact */}
        <Section id="contact" title="11. Liên hệ">
          <p>Nếu có thắc mắc hay khiếu nại về quyền riêng tư, vui lòng liên hệ: <a href="mailto:privacy@foodtour.example">privacy@foodtour.example</a> hoặc CSKH 24/7: 1900 0000.</p>
        </Section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-500">
          <a href="/" className="hover:underline">← Về trang chủ</a>
          <p className="mt-2">© {new Date().getFullYear()} FoodTour. Tất cả các quyền được bảo lưu.</p>
        </footer>
      </div>
    </main>
  );
};

