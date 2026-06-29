**BRIEF KỸ THUẬT**

**Trang đăng ký & bán vé sự kiện thể thao**

*Tài liệu yêu cầu sản phẩm (Product Brief / PDF) để bàn giao cho đội phát triển*

Tham chiếu mô hình: iRace.vn (ticket.irace.vn) · Enjoy Sport

Người lập brief: \_\_\_\_\_\_\_\_\_\_\_\_   ·   Phiên bản: 1.0   ·   Ngày: \_\_\_/\_\_\_/\_\_\_\_\_\_

# **0\. Cách dùng tài liệu này**

Đây là khung brief để bạn (người đặt đầu bài) điền thông tin sự kiện cụ thể vào, rồi bàn giao cho lập trình viên / đối tác code. Mục tiêu là để dev hiểu “làm cái gì, cho ai, theo luồng nào” mà không phải đoán.

Nguyên tắc viết brief để dev build được:

1. **Mô tả KẾT QUẢ, không mô tả công nghệ.** Bạn nói rõ trải nghiệm người dùng và các quy tắc nghiệp vụ; để dev tự chọn ngôn ngữ, framework, hạ tầng.

2. **Mọi tính năng phải có độ ưu tiên.** Dùng nhãn Must / Should / Could (xem mục 6\) để dev biết cái gì cần cho lần ra mắt đầu tiên (MVP) và cái gì để sau.

3. **Chốt phần “biến số” trước khi code.** Các ô gạch chân \_\_\_\_\_\_\_\_\_\_ và Mục 13 (Checklist quyết định) là những thứ bắt buộc bạn phải điền — thiếu chúng dev sẽ bị kẹt.

4. **Kèm tiêu chí nghiệm thu.** Mục 14 giúp bạn và dev thống nhất “thế nào là làm xong”, tránh tranh cãi khi bàn giao.

**Lưu ý quan trọng nhất cho sự kiện của bạn:** khác với iRace (mỗi runner tự đăng ký cho chính mình), sự kiện thể thao trẻ em/gia đình có đặc thù **người mua vé (phụ huynh) khác người tham gia (trẻ), và một đơn hàng thường gồm nhiều bé**. Toàn bộ cấu trúc dữ liệu và form phải thiết kế theo đặc thù này (xem Mục 2 và Mục 7).

# **1\. Mục tiêu & phạm vi (Scope)**

### **1.1. Mục tiêu sản phẩm**

Một trang web cho phép phụ huynh/khách: xem thông tin sự kiện → chọn loại vé → đăng ký thông tin người tham gia → mua thêm tiện ích → thanh toán online → nhận vé điện tử (e-ticket/mã QR). Đồng thời ban tổ chức (BTC) có khu quản trị để theo dõi đơn, doanh thu và check-in tại sự kiện.

### **1.2. Trong phạm vi (In-scope) — bản đầu tiên**

* Trang giới thiệu sự kiện (landing) có nút “Đăng ký / Mua vé”

* Luồng đăng ký nhiều bước có chọn loại vé, nhập thông tin người tham gia, tiện ích đi kèm

* Thanh toán online (cổng nội địa) \+ xác nhận đơn

* Email xác nhận \+ vé điện tử có mã QR

* Khu quản trị (admin) xem danh sách đăng ký, xuất Excel, check-in bằng QR

* Giao diện ưu tiên điện thoại (mobile-first), song ngữ tùy chọn (VI/EN)

### **1.3. Ngoài phạm vi (Out-of-scope) — ghi rõ để tránh “phình” dự án**

* Kết nối thiết bị theo dõi (Strava/Garmin) — chỉ cần nếu làm giải chạy ảo (virtual race)

* App di động riêng (chỉ làm web responsive)

* Bảng xếp hạng/tính giờ chip điện tử (trừ khi sự kiện có thi đấu tính giờ)

* Hệ thống affiliate/đại lý bán vé (có thể làm ở giai đoạn sau)

### **1.4. Quyết định nền tảng: Tự code hay dùng nền tảng có sẵn?**

Trước khi giao cho dev, cân nhắc 3 hướng — ghi rõ hướng đã chọn cho dev:

| Hướng | Khi nào phù hợp | Đánh đổi |
| :---- | :---- | :---- |
| **A. Dùng nền tảng có sẵn(iRace / Enjoy Sport)** | Cần ra mắt nhanh, không muốn lo thanh toán/pháp lý/hạ tầng, chấp nhận giao diện theo khuôn của họ | Mất % phí/vé, ít tùy biến thương hiệu, dữ liệu khách nằm trên hệ thống bên thứ ba |
| **B. Tự code trang riêng(brief này)** | Muốn kiểm soát thương hiệu Konnit, sở hữu dữ liệu khách hàng, dùng lại cho nhiều mùa/nhiều sự kiện | Tốn thời gian & chi phí dev, phải tự lo cổng thanh toán, bảo mật, vận hành |
| **C. Lai (Hybrid)** | Landing \+ thương hiệu tự làm; phần thu tiền nhúng cổng vé bên thứ ba hoặc link thanh toán | Trải nghiệm hơi “ngắt quãng” khi chuyển sang trang thanh toán ngoài |

**▶ Hướng đã chọn cho dự án này:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

# **2\. Đối tượng người dùng & bối cảnh đặc thù**

### **2.1. Ba nhóm người dùng**

| Vai trò | Họ cần gì |
| :---- | :---- |
| **Phụ huynh (người mua)** | Mua vé cho 1–nhiều bé trong cùng một đơn, chọn đúng nhóm tuổi, thanh toán nhanh trên điện thoại, nhận vé rõ ràng |
| **Trẻ (người tham gia)** | Không thao tác trực tiếp; nhưng hệ thống cần lưu thông tin của từng bé: họ tên, ngày sinh/nhóm tuổi, giới tính, size áo, lưu ý sức khỏe |
| **Ban tổ chức (admin)** | Theo dõi số vé bán ra theo thời gian thực, biết còn bao nhiêu suất mỗi nhóm tuổi, xuất danh sách, check-in tại cổng |

### **2.2. Năm khác biệt then chốt so với giải chạy người lớn (iRace)**

Đây là phần dev hay làm sai nếu chỉ copy mô hình iRace. Nhấn mạnh rõ:

**• 1 đơn \= nhiều người tham gia:** Một phụ huynh phải thêm được nhiều bé trong cùng một lần thanh toán (như “giỏ hàng” nhiều vé), không bắt mỗi bé một tài khoản.

**• Tách người mua và người chơi:** Form phải có khối “Thông tin người liên hệ/thanh toán” (phụ huynh) tách khỏi khối “Thông tin từng bé”.

**• Nhóm tuổi quyết định loại vé:** Vé phân theo nhóm tuổi \- NĂM SINH. Hệ thống nên kiểm tra ngày sinh để gợi ý/khóa đúng nhóm tuổi, tránh đăng ký sai cự ly.

**• Yếu tố pháp lý trẻ em:** Cần ô xác nhận cam kết/miễn trừ trách nhiệm của phụ huynh, thông tin người giám hộ và số điện thoại khẩn cấp, lưu ý dị ứng/sức khỏe.

**• Size & quà theo trẻ em:** Áo, huy chương, BIB phải theo bảng size trẻ em; phần khắc tên huy chương rất được ưa chuộng (học từ iRace).

# **3\. Luồng người dùng (User flow)**

Luồng đăng ký → thanh toán nên gói gọn trong càng ít bước càng tốt (mục tiêu ≤ 5 màn). Đề xuất:

| Bước | Màn hình | Hành động & quy tắc |
| ----- | :---- | :---- |
| **1** | **Trang sự kiện (Landing)** | Xem mô tả, lịch, địa điểm, bảng giá, hạn đăng ký, số suất còn lại. Nhấn “Đăng ký / Mua vé”. Nút tắt nếu hết hạn hoặc hết suất. |
| **2** | **Chọn loại vé & số lượng** | Chọn loại vé theo nhóm tuổi \+ số lượng từng loại (kiểu giỏ hàng). Hiển thị tạm tính. Áp mã giảm giá (nếu có). |
| **3** | **Thông tin người tham gia** | Lặp theo số vé đã chọn: nhập thông tin từng bé. Khối riêng cho thông tin phụ huynh/liên hệ. Tick cam kết phụ huynh. |
| **4** | **Tiện ích đi kèm (tùy chọn)** | Mua thêm: áo, khắc tên huy chương, suất ăn, gói chụp hình, thuê xe… Bỏ qua được. |
| **5** | **Xác nhận & thanh toán** | Tổng kết đơn, chọn cổng thanh toán, thanh toán. Xử lý đơn “chờ thanh toán” (pending) và đơn thành công. |
| **6** | **Hoàn tất** | Trang cảm ơn \+ mã đơn. Gửi email xác nhận kèm vé điện tử (mã QR) cho từng bé. Cho tra cứu lại đơn. |

*Quy tắc UX bắt buộc: lưu tạm dữ liệu khi người dùng quay lại bước trước; báo lỗi rõ ràng; không bắt tạo tài khoản mới được phép “đặt vé như khách” (guest checkout) để giảm bỏ giỏ.*

# **4\. Cấu trúc trang & mô tả màn hình**

### **4.1. Trang sự kiện (Landing)**

* Ảnh bìa/banner, tên sự kiện, ngày – giờ – địa điểm (có nút mở Google Maps)

* Khối thông tin nhanh: đối tượng/nhóm tuổi, hạn đăng ký, số suất còn lại (đếm thời gian thực)

* Mô tả chương trình, lịch trình, thể lệ, quyền lợi/quà tặng (áo, huy chương…)

* Bảng giá vé theo nhóm tuổi & mốc thời gian (Early bird / Thường)

* Khối nhà tài trợ/đối tác (logo)

* FAQ ngắn \+ thông tin liên hệ BTC

* Nút “Đăng ký / Mua vé” cố định (sticky) khi cuộn trên điện thoại

### **4.2. Màn chọn vé**

* Danh sách loại vé: tên, mô tả ngắn, giá hiện hành, số suất còn lại của loại đó

* Bộ tăng/giảm số lượng cho từng loại (cho phép mua nhiều bé)

* Ô nhập mã giảm giá / mã nhóm

* Thanh tạm tính luôn hiển thị (sticky)

### **4.3. Form thông tin (quan trọng nhất)**

**Khối A – Người liên hệ / thanh toán (phụ huynh):** Họ tên, SĐT, email, (tùy chọn) địa chỉ nhận quà.

**Khối B – Lặp cho từng bé:** Họ tên bé, ngày sinh (suy ra nhóm tuổi), giới tính, size áo, số BIB (tự sinh hoặc tự chọn), khắc tên huy chương, lưu ý sức khỏe/dị ứng.

**Khối C – Pháp lý:** Người giám hộ \+ SĐT khẩn cấp; checkbox “Tôi đã đọc và đồng ý Thể lệ & Cam kết miễn trừ trách nhiệm” (bắt buộc tick mới đi tiếp); checkbox đồng ý nhận thông tin (tùy chọn).

Tính năng tiện lợi: nút “Sao chép thông tin phụ huynh”, “Thêm bé” / “Xóa bé”, tự kiểm tra ngày sinh khớp nhóm tuổi của vé.

### **4.4. Màn tiện ích (add-ons)**

Danh sách tiện ích mua thêm, gắn theo từng bé hoặc theo đơn. Không bắt buộc (học từ mục “Tiện ích” của iRace).

### **4.5. Màn thanh toán & hoàn tất**

* Tổng kết: danh sách bé \+ vé \+ tiện ích \+ giảm giá \+ tổng tiền

* Chọn cổng thanh toán; nếu chuyển khoản tay: hiện QR ngân hàng \+ nội dung chuyển khoản theo mã đơn

* Trang cảm ơn \+ mã đơn; trạng thái đơn: Chờ thanh toán / Đã thanh toán / Hủy

* Vé điện tử có mã QR cho từng bé (dùng để check-in)

### **4.6. Khu tra cứu / tài khoản**

Cho phép tra cứu đơn bằng mã đơn \+ email/SĐT (không bắt buộc đăng nhập). Xem lại vé, tải lại e-ticket, theo dõi trạng thái giao quà (nếu có).

# **5\. Loại vé, giá & quy tắc bán (bạn điền)**

Ví dụ mẫu cho sự kiện thể thao gia đình/trẻ em — thay bằng dữ liệu thật của bạn:

| Loại vé | Nhóm tuổi | Giá (VNĐ) | Bao gồm / Ghi chú |
| :---- | ----- | ----- | :---- |
| **Vé thi đấu – Mầm** | 2–3 tuổi | \_\_\_\_\_\_ | BIB, áo, huy chương hoàn thành |
| **Vé thi đấu – Chồi** | 4–6 tuổi | \_\_\_\_\_\_ | BIB, áo, huy chương hoàn thành |
| **Vé trải nghiệm (Fun)** | Mọi lứa | \_\_\_\_\_\_ | Không tính thành tích, có quà tham gia |
| **Combo gia đình** | 2 bé+ | \_\_\_\_\_\_ | Ưu đãi khi đăng ký nhiều bé |
| **Vé người lớn đi kèm** | — | Miễn phí / \_\_\_\_\_\_ | Chỉ nếu có giới hạn người vào khu vực |

### **5.1. Quy tắc bán cần khai báo cho dev**

* Mốc giá theo thời gian: Early bird (đến \_\_\_/\_\_\_), Giá thường (từ \_\_\_/\_\_\_). Hệ thống tự đổi giá theo ngày.

* Giới hạn suất: tổng toàn sự kiện \_\_\_ và/hoặc theo từng loại vé \_\_\_. Hết suất → khóa loại vé đó.

* Hạn mở/đóng đăng ký: từ \_\_\_/\_\_\_ đến \_\_\_/\_\_\_.

* Giảm giá nhóm: từ \_\_\_ bé trở lên giảm \_\_\_% (tham khảo iRace cho nhóm).

* Mã giảm giá: danh sách mã, giá trị (% hoặc số tiền), hạn dùng, số lần dùng.

* Chính sách hoàn/đổi vé: ghi rõ (có/không hoàn, phí hủy) — dev cần để dựng quy trình & điều khoản.

# **6\. Bảng yêu cầu chức năng (Functional requirements)**

**Ưu tiên: Must** \= bắt buộc cho lần ra mắt (MVP) · **Should** \= nên có · **Could** \= làm sau.

| Mã | Yêu cầu | Ưu tiên |
| ----- | :---- | ----- |
| **FR-01** | Trang landing sự kiện có nội dung & nút mua vé | **Must** |
| **FR-02** | Chọn nhiều loại vé/nhiều bé trong một đơn | **Must** |
| **FR-03** | Form thông tin tách phụ huynh / từng bé | **Must** |
| **FR-04** | Kiểm tra ngày sinh khớp nhóm tuổi của vé | **Should** |
| **FR-05** | Checkbox cam kết miễn trừ trách nhiệm (bắt buộc) | **Must** |
| **FR-06** | Mua thêm tiện ích (áo, khắc tên, suất ăn…) | **Should** |
| **FR-07** | Đếm số suất còn lại theo thời gian thực \+ khóa khi hết | **Must** |
| **FR-08** | Mốc giá theo thời gian (early bird/thường) | **Should** |
| **FR-09** | Mã giảm giá & giảm giá nhóm | **Should** |
| **FR-10** | Thanh toán online qua cổng nội địa | **Must** |
| **FR-11** | Xử lý đơn pending / hết hạn giữ chỗ | **Must** |
| **FR-12** | Email xác nhận \+ vé điện tử mã QR cho từng bé | **Must** |
| **FR-13** | Tra cứu đơn bằng mã đơn \+ email/SĐT (guest) | **Should** |
| **FR-14** | Admin: danh sách đăng ký, lọc, tìm kiếm | **Must** |
| **FR-15** | Admin: xuất Excel/CSV danh sách & doanh thu | **Must** |
| **FR-16** | Admin: check-in bằng quét QR tại sự kiện | **Should** |
| **FR-17** | Admin: dashboard số vé bán/doanh thu theo loại | **Should** |
| **FR-18** | Song ngữ VI/EN | **Could** |
| **FR-19** | Xuất hóa đơn/biên nhận theo yêu cầu | **Could** |

# **7\. Cấu trúc dữ liệu (Data model)**

Quan hệ cốt lõi (giải thích cho dev hiểu “một đơn nhiều bé”):

**Đơn hàng (Order)** → chứa 1 Người liên hệ (phụ huynh) → chứa nhiều Vé/Người tham gia (Registration) → mỗi vé gắn 1 loại vé \+ nhiều Tiện ích (Add-on).

### **7.1. Các trường dữ liệu cần thu thập**

| Nhóm | Trường | Bắt buộc | Kiểu |
| :---- | :---- | ----- | ----- |
| **Đơn hàng** | Mã đơn, tổng tiền, trạng thái, thời gian tạo | Có | Tự sinh |
| **Phụ huynh** | Họ tên | Có | Text |
| **Phụ huynh** | Số điện thoại | Có | Số |
| **Phụ huynh** | Email | Có | Email |
| **Phụ huynh** | Địa chỉ nhận quà | Tùy | Text |
| **Từng bé** | Họ tên bé | Có | Text |
| **Từng bé** | Ngày sinh | Có | Ngày |
| **Từng bé** | Giới tính | Tùy | Chọn |
| **Từng bé** | Loại vé / nhóm tuổi | Có | Chọn |
| **Từng bé** | Size áo | Có\* | Chọn |
| **Từng bé** | Số BIB | Tùy | Tự sinh/chọn |
| **Từng bé** | Khắc tên huy chương | Tùy | Text |
| **Từng bé** | Lưu ý sức khỏe / dị ứng | Tùy | Text |
| **Pháp lý** | Người giám hộ \+ SĐT khẩn cấp | Có | Text/Số |
| **Pháp lý** | Đồng ý thể lệ & miễn trừ | Có | Checkbox |
| **Tiện ích** | Tên tiện ích, đơn giá, số lượng | — | Danh sách |
| **Thanh toán** | Cổng, mã giao dịch, thời gian | Có | Tự sinh |

*(\*) Bắt buộc nếu vé có kèm áo. Tránh thu thập dữ liệu nhạy cảm không cần thiết của trẻ em.*

# **8\. Thanh toán**

### **8.1. Cổng thanh toán (chọn cho thị trường Việt Nam)**

* Ví/cổng phổ biến: VNPay, MoMo, ZaloPay, Payoo — hỗ trợ thẻ nội địa/QR (cần đăng ký tài khoản merchant).

* Thẻ quốc tế (nếu cần): qua cổng như OnePay/Stripe.

* Chuyển khoản tay \+ QR ngân hàng: rẻ nhất để khởi động, nhưng phải đối soát thủ công — ghi rõ nội dung CK \= mã đơn.

**▶ Cổng đã chọn:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  ·  Tài khoản merchant: đã có / cần đăng ký

### **8.2. Quy tắc xử lý đơn**

* Đơn tạo ra ở trạng thái “Chờ thanh toán”; giữ chỗ tối đa \_\_\_ phút rồi tự hủy nếu chưa thanh toán (nhả suất lại).

* Chỉ trừ suất “thật” khi thanh toán thành công (hoặc giữ tạm có hạn) — tránh bán quá số suất (overselling).

* Webhook xác nhận từ cổng → đổi trạng thái → gửi email vé. Xử lý trường hợp khách thoát giữa chừng.

* Lưu nhật ký giao dịch để đối soát.

# **9\. Email xác nhận, vé điện tử & check-in**

* Email xác nhận tự động sau khi thanh toán: thông tin sự kiện, danh sách bé, mã đơn, vé điện tử.

* Vé điện tử cho TỪNG bé: tên bé, loại vé/nhóm tuổi, số BIB, mã QR riêng.

* Check-in tại sự kiện: admin quét QR → hiện thông tin bé → đánh dấu “đã check-in” (chống dùng lại 1 vé nhiều lần).

* Tùy chọn: nhắc lịch qua email/Zalo trước ngày diễn ra.

# **10\. Khu quản trị (Admin / Backoffice)**

* Danh sách đăng ký: lọc theo loại vé/nhóm tuổi/trạng thái, tìm theo tên/SĐT/mã đơn.

* Xuất Excel/CSV: danh sách bé \+ phụ huynh \+ size áo \+ tiện ích (để in BIB, đặt áo, chia bảng thi đấu).

* Dashboard: số vé bán theo loại, doanh thu, số suất còn lại, biểu đồ theo thời gian.

* Quản lý sự kiện: tạo/sửa sự kiện, loại vé, giá, mốc thời gian, mã giảm giá, số suất.

* Check-in tại cổng bằng QR (có thể trên điện thoại nhân sự).

* Phân quyền: admin (toàn quyền) vs nhân sự cổng (chỉ check-in).

# **11\. Yêu cầu phi chức năng & pháp lý**

| Hạng mục | Yêu cầu |
| :---- | :---- |
| **Thiết bị** | Mobile-first — phần lớn phụ huynh đăng ký bằng điện thoại; phải mượt trên màn nhỏ. |
| **Hiệu năng** | Chịu được lượt truy cập tăng đột biến khi mở bán/early bird; tải trang nhanh. |
| **Bảo mật** | HTTPS; không tự lưu thông tin thẻ (để cổng xử lý); chống spam form (captcha). |
| **Dữ liệu cá nhân** | Tuân thủ quy định bảo vệ dữ liệu cá nhân của VN: nêu rõ mục đích thu thập, có chính sách bảo mật; cẩn trọng với dữ liệu trẻ em. |
| **Hóa đơn** | Nếu khách cần hóa đơn: thu thông tin xuất hóa đơn; cân nhắc tích hợp hóa đơn điện tử. |
| **Pháp lý nội dung** | Trang cần: Thể lệ, Cam kết miễn trừ, Chính sách hoàn/hủy, Chính sách bảo mật, Liên hệ. |
| **Theo dõi** | Gắn được Google Analytics / Meta Pixel để đo chuyển đổi quảng cáo. |

# **12\. Đối chiếu mô hình tham khảo**

Học theo điều gì từ iRace / Enjoy Sport — và điều gì cần làm khác:

| Tính năng tham khảo | Học theo (Áp dụng) | Làm khác cho sự kiện gia đình |
| :---- | :---- | :---- |
| **Phân “cự ly” khi đăng ký** | Tách loại vé rõ ràng ngay từ đầu | Đổi “cự ly” thành “nhóm tuổi”; khóa theo ngày sinh |
| **Khắc tên huy chương** | Áp dụng nguyên — rất được ưa chuộng | Thêm trường khắc tên cho từng bé |
| **Tiện ích mua thêm** | Áp dụng (áo, phụ kiện…) | Thêm tiện ích thân thiện gia đình: suất ăn, chụp hình |
| **Đăng ký nhóm tới 10 người** | Cho mua nhiều vé trong một đơn | Tối ưu cho “nhiều bé một phụ huynh” \+ combo gia đình |
| **Đếm suất thời gian thực** | Áp dụng để tạo cảm giác khan hiếm | Đếm riêng theo từng nhóm tuổi |
| **Mã tham gia / chia sẻ giảm giá** | Áp dụng mã giảm giá & nhóm | Có thể dùng mã riêng cho đối tác (Nam Long, PMH…) |
| **BIB tự sinh / tự chọn** | Áp dụng | Cỡ BIB phù hợp trẻ em |
| **Theo dõi đơn & giao quà** | Trang tra cứu đơn cho khách | Giữ đơn giản, ưu tiên guest checkout |

# **13\. Checklist quyết định cần chốt trước khi code**

Điền hết các ô này trước khi giao dev — đây là những thứ hay làm dev kẹt giữa chừng:

1. Hướng nền tảng: tự code / dùng nền tảng có sẵn / lai

2. Danh sách loại vé \+ giá \+ nhóm tuổi cụ thể

3. Mốc giá (early bird / thường) và ngày áp dụng

4. Tổng số suất & số suất từng loại vé

5. Hạn mở/đóng đăng ký

6. Cổng thanh toán \+ đã có tài khoản merchant chưa

7. Chính sách hoàn/đổi/hủy vé

8. Danh sách tiện ích mua thêm \+ giá

9. Bảng size áo trẻ em

10. Nội dung: Thể lệ, Cam kết miễn trừ, Chính sách bảo mật

11. Email gửi đi: địa chỉ gửi, nội dung, có cần Zalo không

12. Ai cần quyền admin; ai chỉ check-in

13. Tên miền/subdomain để đặt trang (vd: dangky.konnit.vn)

14. Song ngữ hay chỉ tiếng Việt

15. Ngân sách & thời hạn ra mắt mong muốn

# **14\. Tiêu chí nghiệm thu & mốc bàn giao**

### **14.1. Tiêu chí nghiệm thu (Acceptance criteria) — ví dụ**

* Phụ huynh đăng ký được 3 bé khác nhóm tuổi trong một đơn và thanh toán thành công.

* Sau thanh toán, nhận email kèm 3 vé QR riêng cho 3 bé trong vòng 1 phút.

* Khi một loại vé hết suất, hệ thống khóa loại đó, không cho mua tiếp.

* Admin xuất được file Excel đầy đủ thông tin để đặt áo và in BIB.

* Quét QR tại cổng hiện đúng thông tin bé và đánh dấu đã check-in; quét lại báo “đã dùng”.

* Toàn bộ luồng dùng tốt trên điện thoại.

### **14.2. Mốc bàn giao gợi ý**

| Mốc | Nội dung | Kết quả bàn giao |
| ----- | :---- | :---- |
| **M1** | Wireframe \+ thống nhất luồng & loại vé | Bản phác màn hình để duyệt |
| **M2** | Landing \+ luồng đăng ký (chưa thanh toán) | Bản demo nhập liệu chạy được |
| **M3** | Tích hợp thanh toán \+ email \+ vé QR | Đặt vé thật thử nghiệm end-to-end |
| **M4** | Admin \+ check-in \+ xuất Excel | BTC tự vận hành được |
| **M5** | Kiểm thử tải, sửa lỗi, lên sóng | Trang chính thức \+ tài liệu hướng dẫn |

# **15\. Câu hỏi nên hỏi lại dev / đối tác**

1. Đề xuất tự code hay dùng nền tảng có sẵn, vì sao? Chi phí & thời gian mỗi hướng?

2. Cổng thanh toán nào dễ tích hợp & phí hợp lý cho quy mô của mình?

3. Cách chống bán quá số suất khi nhiều người mua cùng lúc?

4. Trang đặt ở đâu (hosting) và chi phí vận hành hằng tháng?

5. Sau sự kiện, mình có giữ lại được toàn bộ dữ liệu khách hàng không?

6. Có dễ nhân bản cho “mùa 2” / sự kiện khác không (tái sử dụng)?

*Hết tài liệu. Sao chép khung này cho mỗi sự kiện và chỉ cần cập nhật phần loại vé, giá, mốc thời gian và nội dung pháp lý.*