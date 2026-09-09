const CAFE_WHATSAPP_NUMBER = "919661023090"; 

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
        const menuIcon = menuBtn.querySelector('i');
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if(navLinks.classList.contains('active')){
                menuIcon.classList.remove('fa-bars'); menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times'); menuIcon.classList.add('fa-bars');
            }
        });
    }

    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active'); observer.unobserve(entry.target); 
        });
    }, revealOptions);
    revealElements.forEach(el => revealOnScroll.observe(el));

    const currentLocation = location.pathname.split("/").pop();
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        if(link.getAttribute('href') === currentLocation || (currentLocation === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active-link');
        }
    });

    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const addressInput = document.getElementById('custAddress');
    
    if(nameInput) {
        nameInput.value = localStorage.getItem('nukkad_custName') || "";
        nameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
            localStorage.setItem('nukkad_custName', e.target.value); validateCheckoutForm();
        });
    }
    if(phoneInput) {
        phoneInput.value = localStorage.getItem('nukkad_custPhone') || "";
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 10);
            localStorage.setItem('nukkad_custPhone', e.target.value); validateCheckoutForm();
        });
    }
    if(addressInput) {
        addressInput.value = localStorage.getItem('nukkad_custAddress') || "";
        addressInput.addEventListener('input', (e) => {
            localStorage.setItem('nukkad_custAddress', e.target.value); validateCheckoutForm();
        });
    }

    updateCartUI();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

let cart = JSON.parse(localStorage.getItem('nukkad_cafe_cart')) || [];

function toggleCart(e) {
    if(e) e.preventDefault();
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if(sidebar && overlay) { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); }
}

function toggleAddressForm() {
    const trigger = document.getElementById('cartFormTrigger');
    const content = document.getElementById('cartFormContent');
    if (trigger && content) { trigger.classList.toggle('active'); content.classList.toggle('active'); }
}

function addToCart(itemName, itemPrice) {
    const existingItem = cart.find(item => item.name === itemName);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    
    updateCartUI();
    
    const btn = event.currentTarget; 
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added';
    btn.style.borderColor = '#25D366'; btn.style.color = '#25D366';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.borderColor = 'var(--glass-border)'; btn.style.color = 'var(--text-main)';
    }, 1500);

    const floatingBtn = document.querySelector('.floating-cart-btn');
    if (floatingBtn) {
        floatingBtn.style.transform = 'scale(1.25)';
        setTimeout(() => floatingBtn.style.transform = '', 300);
    }
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCartUI();
}

function validateCheckoutForm() {
    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const addressInput = document.getElementById('custAddress');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    const name = nameInput?.value.trim() || "";
    const phone = phoneInput?.value.trim() || "";
    const address = addressInput?.value.trim() || "";

    const isNameValid = name.length >= 2; 
    const isPhoneValid = phone.length === 10; 
    const isAddressValid = address.length >= 5 && /[A-Za-z]/.test(address);

    const setStyle = (inputEl, isValid, value) => {
        if (!inputEl) return;
        if (value === "") inputEl.style.borderColor = 'var(--glass-border)';
        else if (isValid) inputEl.style.borderColor = '#25D366';
        else inputEl.style.borderColor = '#FF3B30';
    };

    setStyle(nameInput, isNameValid, name);
    setStyle(phoneInput, isPhoneValid, phone);
    setStyle(addressInput, isAddressValid, address);

    if (checkoutBtn) {
        if (isNameValid && isPhoneValid && isAddressValid && cart.length > 0) {
            checkoutBtn.disabled = false; checkoutBtn.style.opacity = '1'; checkoutBtn.style.cursor = 'pointer';
        } else {
            checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.4'; checkoutBtn.style.cursor = 'not-allowed'; 
        }
    }
}

function updateCartUI() {
    localStorage.setItem('nukkad_cafe_cart', JSON.stringify(cart));

    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.getElementById('cart-count');
    const floatingCartCount = document.getElementById('floating-cart-count');
    const cartFormContainer = document.getElementById('cartFormContainer');
    
    let itemCount = 0;
    cart.forEach(item => itemCount += item.quantity);
    
    if(cartCountElement) cartCountElement.innerText = itemCount;
    if(floatingCartCount) floatingCartCount.innerText = itemCount;

    if (!cartItemsContainer || !cartTotalElement) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
        if (cartFormContainer) cartFormContainer.style.display = 'none'; 
    } else {
        if (cartFormContainer) cartFormContainer.style.display = 'block'; 
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemHTML = `
                <div class="cart-item">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <span class="item-price">₹${item.price}</span>
                    </div>
                    <div class="item-controls">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
    }
    
    cartTotalElement.innerText = `₹${total}`;
    validateCheckoutForm();
}

function checkoutWhatsApp() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (cart.length === 0 || (checkoutBtn && checkoutBtn.disabled)) return; 

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    let message = `Name: ${name}\r\n`;
    message += `Delivery Address: ${address}\r\n`;
    message += `Phone Number: ${phone}\r\n\r\n`;
    message += `Items (with price):\r\n`;
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        message += `${item.quantity}x ${item.name} (₹${item.price} ea) - ₹${itemTotal}\r\n`;
        total += itemTotal;
    });
    
    message += `\r\nTotal: ₹${total}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${CAFE_WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappURL, "_blank");
}