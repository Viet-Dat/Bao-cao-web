/* ==================================================
   [js/main.js] - CẬP NHẬT: LOGIC GIỎ HÀNG VÀ XEM NHANH
================================================= */

// Khởi tạo Object cấu trúc logic cho ứng dụng
const App = {
    // 1. Quản lý trạng thái Giỏ hàng
    // 1. Quản lý trạng thái Giỏ hàng (ĐÃ NÂNG CẤP DÙNG LOCALSTORAGE)
    cart: {
        items: [], // Danh sách các sản phẩm đang có trong giỏ
        
        // Khởi tạo: Đọc dữ liệu từ bộ nhớ khi tải trang
        init: function() {
            const storedCart = localStorage.getItem('quangthanhdat_cart');
            if (storedCart) {
                this.items = JSON.parse(storedCart);
            }
            this.updateHeaderCount();
        },

        // Hàm thêm sản phẩm (Thêm tham số 'image' để lấy ảnh)
        addToCart: function(id, name, price, size, qty, image) {
            // Kiểm tra xem sản phẩm (cùng ID và Size) đã có trong giỏ chưa
            let existingItem = this.items.find(item => item.id === id && item.size === size);
            
            if (existingItem) {
                existingItem.qty += parseInt(qty); // Có rồi thì cộng dồn số lượng
            } else {
                // Chưa có thì thêm mới hoàn toàn
                this.items.push({ id, name, price, size, qty: parseInt(qty), image });
            }
            
            this.saveCart(); // Lưu vào bộ nhớ
            this.updateHeaderCount(); // Cập nhật chấm đỏ trên Header
        },

        // Lưu giỏ hàng vào trình duyệt
        saveCart: function() {
            localStorage.setItem('quangthanhdat_cart', JSON.stringify(this.items));
        },

        // Cập nhật số lượng trên Header
        updateHeaderCount: function() {
            const totalQty = this.items.reduce((sum, item) => sum + item.qty, 0);
            const countEl = document.getElementById('cart-count');
            if(countEl) countEl.innerText = totalQty;
        }
    },
    // 2. Logic cho Popup Xem Nhanh (QUICKVIEW)
    quickView: {
        modal: null,
        swiperGallery: null,
        swiperThumbs: null,
        currentProduct: null,

        // Khởi tạo các sự kiện cho Xem Nhanh
        init: function() {
            this.modal = $('#quickview-modal');
            if (!this.modal.length) return;

            const self = this;

            // Sự kiện 1: Bấm icon con mắt -> Mở Popup
            $('.btn-quickview').on('click', function(e) {
                e.preventDefault(); // Chống nhảy trang do thẻ A bao ngoài
                const productLoop = $(this).closest('.product-loop');
                self.open(productLoop);
            });

            // Sự kiện 2: Bấm nút đóng Modal
            $('.btn-close-modal, #quickview-modal').on('click', function(e) {
                // Chỉ đóng nếu click vào nút X hoặc ra ngoài nền đen (overlay)
                if ($(e.target).is('.modal-overlay, .fas.fa-times')) {
                    self.close();
                }
            });

            // Ngăn sự kiện click trong container nổi lên nền (chống đóng nhầm)
            $('.modal-container').on('click', function(e) {
                e.stopPropagation();
            });

            // Sự kiện 3: Bấm nút Size -> Chọn Size
            $('#qv-size-container').on('click', '.btn-size-qv', function() {
                $('.btn-size-qv').removeClass('active');
                $(this).addClass('active');
                $('#qv-selected-size-label').innerText = $(this).innerText;
            });
            // Sự kiện 3b: Bấm nút Color -> Chọn Color
            $('#qv-color-container').on('click', '.btn-variant-qv', function() {
                $('#qv-color-container .btn-variant-qv').removeClass('active');
                $(this).addClass('active');
            });

            // Sự kiện 4: Bấm nút Tăng/Giảm số lượng
            $('#qv-plus').on('click', function() { self.adjustQty(1); });
            $('#qv-minus').on('click', function() { self.adjustQty(-1); });

            // Sự kiện 5: Bấm nút "Thêm vào giỏ" trong Popup
            $('#btn-qv-add-to-cart').on('click', function() { self.handleAddToCart(); });
        },

        // Mở popup: Lấy dữ liệu và điền vào
        open: function(productElement) {
            // Lấy dữ liệu JSON từ data attributes của .product-loop
            this.currentProduct = {
                id: productElement.data('id'),
                name: productElement.data('name'),
                price: productElement.data('price'),
                images: productElement.data('images'),
                sizes: productElement.data('sizes'),
                handle: productElement.data('handle') // link cho Xem chi tiết
            };

            console.log("Mở Xem nhanh:", this.currentProduct);

            // Điền thông tin vào Modal
            $('#qv-id').text(this.currentProduct.id);
            $('#qv-name').text(this.currentProduct.name);
            $('#qv-price').text(this.currentProduct.price.toLocaleString('vi-VN') + 'đ');
            
            // Cập nhật link "Xem chi tiết" (ảnh 3)
            $('#qv-detail-link').attr('href', `product.html?product=${this.currentProduct.handle}`);

            // Reset số lượng về 1
            $('#qv-qty-input').val(1);

            // Điền slide ảnh
            this.fillGallery();

            // Điền nút Size
            this.fillSizes();

            // Hiện modal
            this.modal.addClass('open');
            
            // Khởi tạo slider bên trong popup sau khi HTML đã có đủ slide
            this.initSliders();
        },

        // Đóng popup và hủy slider
        close: function() {
            this.modal.removeClass('open');
            if(this.swiperGallery) this.swiperGallery.destroy();
            if(this.swiperThumbs) this.swiperThumbs.destroy();
        },

        // Điền HTML cho Gallery slide
        fillGallery: function() {
            const wrapper = $('#qv-swiper-wrapper').empty();
            const thumbsWrapper = $('#qv-thumbs-wrapper').empty();

            this.currentProduct.images.forEach(imgUrl => {
                wrapper.append(`<div class="swiper-slide"><img src="${imgUrl}" alt="${this.currentProduct.name}"></div>`);
                thumbsWrapper.append(`<div class="swiper-slide"><img src="${imgUrl}" alt="${this.currentProduct.name} Thumbs"></div>`);
            });
        },

        // Khởi tạo Swiper Slider
        initSliders: function() {
            // Slider thu nhỏ
            this.swiperThumbs = new Swiper(".quickview-thumbs", {
                spaceBetween: 10,
                slidesPerView: 4,
                freeMode: true,
                watchSlidesProgress: true,
            });
            // Slider chính
            this.swiperGallery = new Swiper(".quickview-swiper", {
                spaceBetween: 10,
                navigation: {
                    nextEl: ".qv-next",
                    prevEl: ".qv-prev",
                },
                thumbs: {
                    swiper: this.swiperThumbs,
                },
            });
        },

        // Điền HTML cho các nút Size
        fillSizes: function() {
            const container = $('#qv-size-container').empty();
            this.currentProduct.sizes.forEach((size, index) => {
                const activeClass = index === 0 ? 'active' : '';
                // Đổi class từ btn-size-qv thành btn-variant-qv
                container.append(`<button class="btn-variant-qv ${activeClass}">${size}</button>`);
            });
        },

        // Tăng giảm số lượng
        adjustQty: function(change) {
            const input = $('#qv-qty-input');
            let val = parseInt(input.val()) || 1;
            val += change;
            if (val < 1) val = 1;
            input.val(val);
        },

        // Xử lý thêm vào giỏ hàng từ popup
        handleAddToCart: function() {
            const qty = $('#qv-qty-input').val();
            const size = $('.btn-size-qv.active').innerText;
            
            App.cart.addToCart(
                this.currentProduct.id,
                this.currentProduct.name,
                this.currentProduct.price,
                size,
                qty
            );
            this.close(); // Đóng popup sau khi thêm
        }
    },
    // 3. Logic Xác thực và Phân quyền
    auth: {
        currentUser: null,

        init: function() {
            // Lấy thông tin user từ LocalStorage
            const storedUser = localStorage.getItem('bckUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                this.applyRoleUI();
            }

            this.bindEvents();
            this.renderAccountInfo();
        },

        bindEvents: function() {
            const self = this;

            // Xử lý Form Đăng nhập/Đăng ký tại auth.html
            $('#auth-form').on('submit', function(e) {
                e.preventDefault();
                const email = $('#auth-email').val();
                const pwdInput = $('#auth-password');
                const btn = $('#btn-auth-continue');

                // Luồng UX giả lập: Nếu mới nhập email, nhấn tiếp tục -> hiện ô password
                if (pwdInput.is(':hidden')) {
                    pwdInput.show().attr('required', true);
                    btn.text('Đăng nhập / Đăng ký');
                    return;
                }

                // Thực thi đăng nhập
                const password = pwdInput.val();
                self.processLogin(email, password);
            });

            // Xử lý Đăng xuất
            $('#btn-logout').on('click', function() {
                localStorage.removeItem('bckUser');
                window.location.href = 'index.html';
            });
        },

        processLogin: function(email, password) {
            let role = 'customer';
            
            // Logic phân quyền giả lập
            if (email === 'admin@bacykism.com') {
                role = 'admin';
            }

            const userData = { email: email, role: role };
            
            // Lưu Session vào trình duyệt
            localStorage.setItem('bckUser', JSON.stringify(userData));
            
            alert(`Đăng nhập thành công với quyền: ${role.toUpperCase()}`);
            window.location.href = 'account.html'; // Chuyển hướng tới Dashboard
        },

        applyRoleUI: function() {
            // Nếu là Admin thì thêm quyền Xóa SP
            if (this.currentUser && this.currentUser.role === 'admin') {
                $('body').addClass('role-admin');
                console.log("Admin Mode Enabled.");
            }

            // Giao diện chung khi ĐÃ ĐĂNG NHẬP (Hiển thị Dropdown Menu)
            if (this.currentUser) {
                // 1. Thêm class 'logged-in' để CSS biết mà hiện bảng khi di chuột
                $('#user-wrapper').addClass('logged-in');
                
                // 2. Sửa link của icon từ 'login.html' thành 'account.html'
                $('#user-icon-link').attr('href', 'account.html');

                // 3. Xử lý nút Đăng xuất ngay trên thanh Header
                $('#btn-logout-header').on('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('bckUser'); // Xóa trí nhớ
                    window.location.reload(); // Tải lại trang (sẽ mất dropdown)
                });
            }
        },

        renderAccountInfo: function() {
            // Render email lên trang account.html
            if ($('body').hasClass('account-page') && this.currentUser) {
                $('#display-user-email').text(this.currentUser.email);
            }
        }
    },

    // Hàm khởi tạo tổng thể
    init: function() {
        console.log("Bacykism Clone đã sẵn sàng!");
        
        // Chạy module Xem Nhanh
       if (this.quickView) this.quickView.init();
        this.auth.init(); // Khởi chạy Auth module
    }
};

// Chạy khởi tạo khi tài liệu (HTML) tải xong
document.addEventListener("DOMContentLoaded", function() {
    App.init();
});