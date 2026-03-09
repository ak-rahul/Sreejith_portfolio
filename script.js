/* Sreejith M R Portfolio - Interactivity */

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Interaction
    const revealElements = document.querySelectorAll('[data-reveal]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section, header');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;

        // Reveal elements
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight * 0.85) {
                el.classList.add('active');
            }
        });

        // Update active nav link
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinksList = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            mobileMenu.innerHTML = navLinksList.classList.contains('active')
                ? '<i data-lucide="x"></i>'
                : '<i data-lucide="menu"></i>';
            lucide.createIcons();
        });
    }

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksList.classList.remove('active');
            if (mobileMenu) {
                mobileMenu.innerHTML = '<i data-lucide="menu"></i>';
                lucide.createIcons();
            }
        });
    });

    // Number Counting Animation
    const stats = document.querySelectorAll('[data-target]');
    const countOptions = {
        threshold: 1,
        rootMargin: "0px 0px -50px 0px"
    };

    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-target'));
                const duration = 800; // Snappier duration for small numbers
                const startTime = performance.now();
                let lastValue = -1;

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Cubic Out - smooth but fast
                    const easedProgress = 1 - Math.pow(1 - progress, 3);
                    const currentCount = Math.floor(easedProgress * endValue);

                    if (currentCount !== lastValue) {
                        target.innerText = currentCount + (target.getAttribute('data-target') === '5' ? '' : '+');
                        lastValue = currentCount;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        target.innerText = endValue + (target.getAttribute('data-target') === '5' ? '' : '+');
                    }
                };

                requestAnimationFrame(animate);
                observer.unobserve(target);
            }
        });
    }, countOptions);

    stats.forEach(stat => countObserver.observe(stat));

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Trigger lucide icons if they need to update inside the button
            // Though CSS handles display: none/block, lucide icons are static SVGs
        });
    }

    // Navbar transparency change on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Form Submission Mock-up
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = "Sending...";
            btn.disabled = true;

            setTimeout(() => {
                btn.innerText = "Message Sent!";
                btn.classList.add('success');
                contactForm.reset();

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('success');
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // Load Articles dynamically from Medium using RSS via proxy
    let allArticles = [];
    let currentArticleIndex = 0;
    const articlesPerLoad = 3;

    const renderArticles = (articlesToRender) => {
        const container = document.getElementById('articles-container');
        if (!container) return;

        let htmlString = '';
        articlesToRender.forEach(item => {
            const title = item.querySelector("title")?.textContent || 'Untitled';

            // Fetch the link
            const linkNode = item.querySelector("link");
            let link = linkNode ? linkNode.textContent : '#';
            if (link.includes('?')) {
                link = link.split('?')[0]; // Clean medium tracking parameters
            }

            // Fetch published date
            const pubDateStr = item.querySelector("pubDate")?.textContent || '';
            const pubDate = new Date(pubDateStr);
            const dateStr = pubDateStr ? pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

            // Fetch Category (Using the first category)
            const categories = Array.from(item.querySelectorAll("category"));
            const category = categories.length > 0 ? categories[0].textContent : 'Medium';

            // Medium puts the full HTML content in <content:encoded>
            const encodedContent = item.getElementsByTagNameNS("*", "encoded")[0]?.textContent || '';
            const descriptionNode = item.querySelector("description");
            const description = descriptionNode ? descriptionNode.textContent : encodedContent;

            // Extract thumbnail from content
            let thumbnail = 'https://via.placeholder.com/600x400?text=Medium+Article';
            const imgMatch = (encodedContent || description).match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
                thumbnail = imgMatch[1];
            }

            // Extract a clean text description
            let plainDoc = new DOMParser().parseFromString(description || encodedContent, 'text/html');
            let textDesc = plainDoc.body.textContent || "";

            // Remove the standard "Continue reading on..." and trim
            textDesc = textDesc.replace(/Continue reading on.*/, '').trim();
            if (textDesc.length > 120) {
                textDesc = textDesc.substring(0, 120) + '...';
            }

            htmlString += `
                <article class="card article-card" data-reveal onclick="window.open('${link}', '_blank')" style="cursor: pointer;">
                    <div class="card-img">
                        <img src="${thumbnail}" alt="${title}">
                    </div>
                    <div class="card-content d-flex flex-column" style="height: 100%; display: flex; flex-direction: column;">
                        <div class="card-meta">
                            <span>${dateStr}</span>
                            <span class="tag">${category}</span>
                        </div>
                        <h3>${title}</h3>
                        <p style="margin-bottom: 2rem; flex-grow: 1;">${textDesc}</p>
                        <div class="card-action" style="margin-top: auto;">
                            <a href="${link}" target="_blank" class="btn btn-outline-primary w-100" style="width: 100%; justify-content: space-between; padding: 0.8rem 1.5rem;" onclick="event.stopPropagation()">
                                Read Article <i data-lucide="external-link" style="width: 18px; height: 18px;"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        });

        // Append to container instead of replacing, so "Load More" adds to existing cards
        container.insertAdjacentHTML('beforeend', htmlString);
        lucide.createIcons();

        // Trigger reveal animation for newly added cards
        setTimeout(() => {
            const unrevealedElements = container.querySelectorAll('.card:not(.active)');
            const windowHeight = window.innerHeight;
            unrevealedElements.forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                // Add active immediately if in view, otherwise it'll be caught by the scroll listener
                if (elementTop < windowHeight * 0.85 || true) { // Force immediately for newly appended
                    // small delay for DOM to register the new CSS class transition
                    setTimeout(() => el.classList.add('active'), 50);
                }
            });
        }, 10);
    };

    const handleLoadMore = () => {
        const nextSet = allArticles.slice(currentArticleIndex, currentArticleIndex + articlesPerLoad);
        renderArticles(nextSet);
        currentArticleIndex += nextSet.length;

        // Hide button if no more articles
        if (currentArticleIndex >= allArticles.length) {
            const btnContainer = document.getElementById('load-more-container');
            if (btnContainer) btnContainer.style.display = 'none';
        }
    };

    const loadArticles = async () => {
        const container = document.getElementById('articles-container');
        if (!container) return;

        // Replace this with your actual Medium username
        const mediumUsername = 'sreejthmr1000';
        const apiUrl = `https://api.codetabs.com/v1/proxy?quest=https://medium.com/feed/@${mediumUsername}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error("Failed to load RSS feed");
            }

            const xmlText = await response.text();

            if (xmlText.trim().startsWith('{')) {
                throw new Error("Proxy returned JSON instead of XML");
            }

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            allArticles = Array.from(xmlDoc.querySelectorAll("item"));

            if (allArticles.length === 0) {
                throw new Error("No articles found in the feed");
            }

            // Clear container before first render
            container.innerHTML = '';

            // Render first batch
            handleLoadMore();

            // Setup Load More button if needed
            const loadMoreBtnContainer = document.getElementById('load-more-container');
            const loadMoreBtn = document.getElementById('load-more-btn');

            if (loadMoreBtn && loadMoreBtnContainer && allArticles.length > articlesPerLoad) {
                loadMoreBtnContainer.style.display = 'block';
                loadMoreBtn.addEventListener('click', handleLoadMore);
            }

        } catch (error) {
            console.error('Error loading articles:', error);
            container.innerHTML = '<p style="text-align:center;width:100%;grid-column:1/-1;">Check back soon for latest articles!</p>';
        }
    };

    loadArticles();

    // Dynamically load College Works PDFs from the uploads folder
    const loadCollegeWorks = async () => {
        const listElement = document.getElementById('college-pdf-list');
        if (!listElement) return;

        try {
            // Fetch the directory listing from http-server
            // We use a cache-buster to ensure we get the latest file list
            const response = await fetch(`Uploads/College%20Works/?t=${Date.now()}`);
            if (!response.ok) throw new Error('Failed to fetch college works directory');

            const htmlText = await response.text();

            // Parse the HTML returned by http-server
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            // Find all links that end with .pdf (case-insensitive)
            // http-server usually lists files as <a> tags with hrefs
            const links = Array.from(doc.querySelectorAll('a'))
                .map(a => a.getAttribute('href'))
                .filter(href => {
                    if (!href) return false;
                    // Filter out parent directories or other types
                    const decoded = decodeURIComponent(href);
                    return decoded.toLowerCase().endsWith('.pdf') && !decoded.includes('../');
                });

            if (links.length === 0) {
                listElement.innerHTML = '<li class="loading">No college projects found.</li>';
                return;
            }

            // Clear the "Loading..." message
            listElement.innerHTML = '';

            links.forEach(href => {
                // Decode URI component to get readable filename
                let filename = decodeURIComponent(href);
                // The structure from http-server might be just the name or a path
                // We want just the name for display
                let displayName = filename.split('/').pop().replace(/\.pdf$/i, '');

                const li = document.createElement('li');
                li.className = 'pdf-item';
                li.setAttribute('data-reveal', '');

                li.innerHTML = `
                    <a href="Uploads/College%20Works/${href}" target="_blank">
                        <i data-lucide="file-text" class="pdf-icon"></i>
                        <span class="pdf-name">${displayName}</span>
                        <i data-lucide="external-link" class="external-icon"></i>
                    </a>
                `;

                listElement.appendChild(li);
            });

            // Initialize icons for new elements
            if (window.lucide) {
                lucide.createIcons();
            }

            // Trigger reveal for new elements
            const newElements = listElement.querySelectorAll('[data-reveal]');
            const windowHeight = window.innerHeight;
            newElements.forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                if (elementTop < windowHeight * 0.9) {
                    el.classList.add('active');
                }
            });

        } catch (error) {
            console.error('Error loading college works:', error);
            listElement.innerHTML = '<li class="error-msg">Failed to load projects. Please refresh.</li>';
        }
    };

    loadCollegeWorks();
});

// Typewriter Effect
const typeWriter = (elementId, speed = 100) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.innerText;
    element.innerText = '';
    let i = 0;

    // Add a cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.innerHTML = '|';
    element.parentNode.insertBefore(cursor, element.nextSibling);

    const typing = () => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else {
            // Optional: keep cursor blinking or remove it
            // cursor.style.display = 'none';
        }
    };

    setTimeout(typing, 1000); // Start after 1 second
};

// Initialize Typewriter
document.addEventListener('DOMContentLoaded', () => {
    typeWriter('typewriter-text', 70);
});
