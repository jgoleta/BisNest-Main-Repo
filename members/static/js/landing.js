// Login Modal Functions
        function openLoginModal(e) {
            if (e) {
                e.preventDefault();
            }
            const modal = document.getElementById('loginModal');
            modal.style.display = 'flex';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeLoginModal() {
            const modal = document.getElementById('loginModal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }

        function switchToRegister(e) {
            e.preventDefault();
            const container = document.querySelector('.modal-container');
            container.classList.add('active');
        }

        function switchToLogin(e) {
            e.preventDefault();
            const container = document.querySelector('.modal-container');
            container.classList.remove('active');
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLoginModal();
            }
        });
        const elements = document.querySelectorAll('.fade-in, .slide-up');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        elements.forEach(el => observer.observe(el));

        const sections = document.querySelectorAll("section");

        const revealSection = () => {
            const triggerBottom = window.innerHeight * 0.85;
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop < triggerBottom) {
                    section.classList.add("visible");
                }
            });
        };

        window.addEventListener("scroll", revealSection);
        window.addEventListener("load", revealSection);

        const navLinks = document.querySelectorAll('a[href^="#"]');

        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && document.querySelector(href)) {
                    e.preventDefault();

                    const target = document.querySelector(href);
                    const offsetTop = target.offsetTop - 80; 
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    navLinks.forEach(l => l.parentElement.classList.remove('active'));
                    this.parentElement.classList.add('active');
                }
            });
        });

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.parentElement.classList.remove('active');
                if (link.getAttribute('href').slice(1) === current) {
                    link.parentElement.classList.add('active');
                }
            });
        });

        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });