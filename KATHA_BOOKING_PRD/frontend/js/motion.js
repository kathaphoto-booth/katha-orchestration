document.addEventListener("DOMContentLoaded", () => {
    const card = document.querySelector('.archive-card');
    const container = document.querySelector('.archive-container');

    if (card && container) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            
            // Calculate mouse position relative to container center
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            
            // Tilt max ±6°
            const maxTilt = 6;
            
            gsap.to(card, {
                rotationY: x * maxTilt,
                rotationX: -y * maxTilt,
                ease: 'none',
                duration: 0.1
            });
        });

        container.addEventListener('mouseleave', () => {
            // Return easing power3.out, duration >= 1.2s
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                ease: 'power3.out',
                duration: 1.2
            });
        });
    }
});
