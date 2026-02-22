document.addEventListener('DOMContentLoaded', () => {
  const sendLinkBtn = document.getElementById('sendLink');
  const emailInput = document.getElementById('email');
  const msgDiv = document.getElementById('msg');

  if (sendLinkBtn && emailInput && msgDiv) {
    sendLinkBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();

      if (!email) {
        showMessage('Zadaj emailovú adresu.', 'warn');
        return;
      }

      if (!isValidEmail(email)) {
        showMessage('Zadaj platnú emailovú adresu.', 'warn');
        return;
      }

      sendLinkBtn.disabled = true;
      sendLinkBtn.textContent = 'Posielam...';

      showMessage('Magic link funkcia bude implementovaná v ďalšej fáze. Zatiaľ nás kontaktuj emailom.', 'success');

      setTimeout(() => {
        sendLinkBtn.disabled = false;
        sendLinkBtn.textContent = 'Poslať magic link';
      }, 2000);
    });
  }

  function showMessage(text, type = 'success') {
    if (!msgDiv) return;
    msgDiv.textContent = text;
    msgDiv.className = `note ${type}`;
    msgDiv.style.display = 'block';

    setTimeout(() => {
      msgDiv.style.display = 'none';
    }, 5000);
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  const navLinks = document.querySelectorAll('.navLinks a');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  const glassCards = document.querySelectorAll('.glassCard');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const glow = card.querySelector('.glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,212,170,0.2) 0%, transparent 50%)`;
      }
    });
  });

  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.panel, .card, .glassCard').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
