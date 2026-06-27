document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Mobile Menu
    // ----------------------------------------------------
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const nav = document.querySelector('.nav');

    if (mobileMenuIcon && nav) {
        mobileMenuIcon.addEventListener('click', () => {
            nav.classList.toggle('active');
        });

        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }

    // ----------------------------------------------------
    // Intersection Observer for Animations
    // ----------------------------------------------------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // ----------------------------------------------------
    // Countdown Timer Logic
    // ----------------------------------------------------
    const countdownElement = document.getElementById("countdown");
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    // Check if the elements exist on the current page before running
    if (countdownElement && daysEl && hoursEl && minutesEl && secondsEl) {
        // Set the date we're counting down to: August 07, 2026 09:00:00
        const countDownDate = new Date("August 07, 2026 09:00:00").getTime();

        // Update the count down every 1 second
        const x = setInterval(function () {
            // Get today's date and time
            const now = Date.now();

            // Find the distance between now and the count down date
            const distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the elements
            daysEl.innerHTML = days < 10 ? "0" + days : days;
            hoursEl.innerHTML = hours < 10 ? "0" + hours : hours;
            minutesEl.innerHTML = minutes < 10 ? "0" + minutes : minutes;
            secondsEl.innerHTML = seconds < 10 ? "0" + seconds : seconds;

            // If the count down is finished, write some text
            if (distance < 0) {
                clearInterval(x);
                countdownElement.innerHTML = "EXPIRADO";
            }
        }, 1000);
    }
});
