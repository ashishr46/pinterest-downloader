document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show selected form
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === tabId) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const passwordInputs = form.querySelectorAll('input[type="password"]');
            if (passwordInputs.length > 1) {
                const [password, confirmPassword] = passwordInputs;
                if (password.value !== confirmPassword.value) {
                    e.preventDefault();
                    alert('Passwords do not match');
                }
            }
        });
    });

    // Google Auth button animation
    const googleAuthBtns = document.querySelectorAll('.google-auth');
    googleAuthBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });
}); 