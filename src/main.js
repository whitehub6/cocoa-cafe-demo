import './style.css';

// Scroll reveal animations
function reveal() {
  const reveals = document.querySelectorAll('.cocoa-section, .cocoa-placeholder-box, .cocoa-menu, .cocoa-callout');
  const windowHeight = window.innerHeight;
  const elementVisible = 100;

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
