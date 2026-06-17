import './style.css';

// Scroll reveal animations
function reveal() {
  const reveals = document.querySelectorAll('.reveal');
  const windowHeight = window.innerHeight;
  const elementVisible = 80;

  reveals.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      element.classList.add('active');
    }
  });
}

// Listeners
window.addEventListener('scroll', reveal);

// Run on initial load
document.addEventListener('DOMContentLoaded', () => {
  reveal();
});

// Fallback in case DOMContentLoaded has already fired
reveal();
