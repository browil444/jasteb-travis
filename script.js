// Data state
let selectedProduct = null;
let selectedPayment = null;
let proofImage = null;

// DANA Info
const DANA_NUMBER = '082210475757';
const STORE_NAME = 'WILDAN NGAJIZI';

// DOM Elements
const steps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3')
};

const contents = {
    1: document.getElementById('content1'),
    2: document.getElementById('content2'),
    3: document.getElementById('content3')
};

// Show specific step
function showStep(step) {
    Object.values(contents).forEach(content => {
        if (content) content.style.display = 'none';
    });
    
    if (contents[step]) contents[step].style.display = 'block';
    
    for (let i = 1; i <= 3; i++) {
        if (steps[i]) {
            steps[i].classList.remove('active', 'completed');
            if (i < step) {
                steps[i].classList.add('completed');
            } else if (i === step) {
                steps[i].classList.add('active');
            }
        }
    }
}

// Format price
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Step 1: Select Product
document.querySelectorAll('.select-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);
        
        document.querySelectorAll('.product-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        card.classList.add('selected');
        
        selectedProduct = { id, name, price };
        document.getElementById('selectedProduct').innerHTML = `${name} - Rp ${formatPrice(price)}`;
        document.getElementById('next1').disabled = false;
    });
});

// Step 1 Next
document.getElementById('next1').addEventListener('click', () => {
    if (selectedProduct) {
        showStep(2);
    }
});

// Step 2: Select Payment
document.querySelectorAll('.payment-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.payment-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        card.classList.add('selected');
        selectedPayment = card.dataset.method;
        document.getElementById('selectedMethod').textContent = selectedPayment;
        document.getElementById('next2').disabled = false;
    });
});

// Step 2 Next
document.getElementById('next2').addEventListener('click', () => {
    showStep(3);
    updateOrderSummary();
    updatePaymentInfo();
});

// Step 2 Previous
document.getElementById('prev2').addEventListener('click', () => {
    showStep(1);
});

// Update order summary
function updateOrderSummary() {
    const orderSummaryDiv = document.getElementById('orderSummary');
    const totalSpan = document.getElementById('totalAmount');
    
    if (selectedProduct) {
        orderSummaryDiv.innerHTML = `
            <div class="order-detail">
                <span>${selectedProduct.name}</span>
                <span>Rp ${formatPrice(selectedProduct.price)}</span>
            </div>
        `;
        totalSpan.textContent = `Rp ${formatPrice(selectedProduct.price)}`;
    }
}

// Update payment info based on selected method
function updatePaymentInfo() {
    const paymentInfoDiv = document.getElementById('paymentInfo');
    let details = '';
    
    if (selectedPayment === 'DANA') {
        details = `
            <h3>Pembayaran via DANA</h3>
            <div class="payment-detail">
                <div class="number">${DANA_NUMBER}</div>
                <div class="name">a.n ${STORE_NAME}</div>
                <p style="font-size: 13px; color: #666; margin-top: 12px;">
                    Transfer ke nomor DANA di atas sesuai total pesanan
                </p>
            </div>
        `;
    } else if (selectedPayment === 'QRIS') {
        details = `
            <h3>Scan QRIS</h3>
            <div class="payment-detail">
                <div class="qris-image">
                    <div class="qris-placeholder" id="qrisPlaceholder">
                    </div>
                    <p style="font-size: 13px; color: #666; margin-top: 12px;">
                        Scan QRIS di atas
                    </p>
                </div>
            </div>
        `;
    }
    
    paymentInfoDiv.innerHTML = details;
    
    // Add QRIS image upload functionality
    if (selectedPayment === 'QRIS') {
        const qrisPlaceholder = document.getElementById('qrisPlaceholder');
        if (qrisPlaceholder) {
            const qrisInput = document.createElement('input');
            qrisInput.type = 'file';
            qrisInput.accept = 'image/*';
            qrisInput.style.display = 'none';
            qrisInput.id = 'qrisUpload';
            
            qrisPlaceholder.style.cursor = 'pointer';
            qrisPlaceholder.onclick = () => {
                qrisInput.click();
            };
            
            qrisInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        qrisPlaceholder.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;">`;
                        qrisPlaceholder.style.padding = '0';
                        qrisPlaceholder.style.background = '#fff';
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            document.body.appendChild(qrisInput);
        }
    }
}

// Upload area functionality
const uploadArea = document.getElementById('uploadArea');
const proofInput = document.getElementById('proofImage');

if (uploadArea) {
    uploadArea.addEventListener('click', () => {
        proofInput.click();
    });
}

if (proofInput) {
    proofInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('imagePreview');
        
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran file maksimal 5MB!');
                return;
            }
            
            proofImage = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Bukti Transfer">`;
                uploadArea.style.borderColor = '#c9a96e';
                uploadArea.style.background = '#fffaf5';
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
            proofImage = null;
            uploadArea.style.borderColor = '#e0d6c8';
            uploadArea.style.background = '#fefcf9';
        }
    });
}

// Send to WhatsApp
const sendOrderBtn = document.getElementById('sendOrder');
if (sendOrderBtn) {
    sendOrderBtn.addEventListener('click', () => {
        // Validasi
        if (!selectedProduct) {
            alert('Pilih produk terlebih dahulu!');
            return;
        }
        
        if (!selectedPayment) {
            alert('Pilih metode pembayaran terlebih dahulu!');
            return;
        }
        
        if (!proofImage) {
            alert('Harap upload bukti pembayaran terlebih dahulu!');
            return;
        }
        
        // Nomor admin dalam format internasional
        const adminPhone = '6282210475757';
        const total = selectedProduct.price;
        
        // Format pesan sesuai yang diminta
        let message = "";
        message += "ORDER BARU - JASTEB TRAVIS%0A";
        message += "%0A";
        message += "================================%0A";
        message += "DETAIL PESANAN:%0A";
        message += "================================%0A";
        message += "Produk: " + selectedProduct.name + "%0A";
        message += "Harga: Rp " + formatPrice(selectedProduct.price) + "%0A";
        message += "Total: Rp " + formatPrice(total) + "%0A";
        message += "Metode Pembayaran: " + selectedPayment + "%0A";
        message += "%0A";
        message += "================================%0A";
        message += "INSTRUKSI:%0A";
        message += "SILAKAN KIRIM BUKTI TRANSFER MELALUI CHAT INI%0A";
        message += "%0A";
        message += "Terima kasih sudah berbelanja!%0A";
        message += "Jasteb Travis";
        
        // Buat URL WhatsApp
        const whatsappUrl = "https://wa.me/" + adminPhone + "?text=" + message;
        
        // Buka WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Tampilkan alert instruksi
        alert('✅ PESANAN DITERIMA!\n\n' +
              'LANGKAH SELANJUTNYA:\n' +
              '1️⃣ WhatsApp akan terbuka\n' +
              '2️⃣ Kirimkan BUKTI TRANSFER yang sudah kamu upload\n' +
              '3️⃣ Admin akan memproses pesananmu\n\n' +
              '📸 Bukti transfer sudah siap di galeri HP');
        
        // Reset setelah konfirmasi
        setTimeout(() => {
            if (confirm('📸 Apakah sudah mengirim bukti transfer?\n\nKlik OK jika sudah mengirim')) {
                if (confirm('🔄 Ingin memesan lagi?')) {
                    resetOrder();
                }
            }
        }, 3000);
    });
}

// Step 3 Previous
const prev3Btn = document.getElementById('prev3');
if (prev3Btn) {
    prev3Btn.addEventListener('click', () => {
        showStep(2);
    });
}

// Reset order
function resetOrder() {
    selectedProduct = null;
    selectedPayment = null;
    proofImage = null;
    
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('selectedProduct').innerHTML = 'Belum ada produk';
    document.getElementById('next1').disabled = true;
    
    document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('selectedMethod').textContent = '-';
    document.getElementById('next2').disabled = true;
    
    if (proofInput) proofInput.value = '';
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.innerHTML = '';
    if (uploadArea) {
        uploadArea.style.borderColor = '#e0d6c8';
        uploadArea.style.background = '#fefcf9';
    }
    
    showStep(1);
}

// Initial step
showStep(1);