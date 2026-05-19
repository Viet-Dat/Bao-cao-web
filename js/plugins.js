/* ==================================================
   [js/plugins.js]
   File này dùng Javascript để tự động tải các thư viện
================================================== */

(function loadPlugins() {
    // Danh sách các thư viện cần dùng cho Bacykism
    const pluginLinks = [
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js",          // jQuery (Bắt buộc phải tải đầu tiên)
        "https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.4/swiper-bundle.min.js",   // Swiper JS (Làm banner trượt)
        "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js",    // Lazysizes (Tải ảnh mượt, chống lag)
        "https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js"   // SweetAlert (Làm popup thông báo đẹp mắt)
    ];

    // Lặp qua danh sách và tự động chèn vào trang
    pluginLinks.forEach(src => {
        let script = document.createElement('script');
        script.src = src;
        script.async = false; // Bắt buộc false để các thư viện load đúng thứ tự (không bị lỗi)
        document.body.appendChild(script);
    });

    console.log("Đã tự động kéo các thư viện JS thành công!");
})();