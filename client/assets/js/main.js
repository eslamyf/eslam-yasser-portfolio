const getApiBase = () => {
    if (window.location.protocol === 'file:') return 'http://localhost:5000/api';
    if (window.location.port && window.location.port !== '5000') {
        return `http://${window.location.hostname || 'localhost'}:5000/api`;
    }
    return '/api';
};
const API_BASE = getApiBase();

// Checks if the API server (port 5000) is available
const SERVER_BASE = API_BASE.replace('/api', '');
let _serverAvailable = null; // null=unknown, true=up, false=down
async function checkServerAvailable() {
    if (_serverAvailable !== null) return _serverAvailable;
    try {
        const r = await fetch(`${SERVER_BASE}/api/cv/active`, { method: 'HEAD', signal: AbortSignal.timeout(1500) });
        _serverAvailable = r.ok || r.status < 500;
    } catch {
        _serverAvailable = false;
    }
    return _serverAvailable;
}

/**
 * Convert any PDF path to a direct browser-accessible URL.
 * Works in Live Server (5501), Express (5000), and production.
 */
function resolveLocalPdfUrl(pdfPath) {
    if (!pdfPath) return null;
    // Already a full https:// URL (Cloudinary, external) — use directly
    if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) return pdfPath;
    // /assets/pdf/... or assets/pdf/... => serve relative to current page origin
    const clean = pdfPath.replace(/^\/+/, '');
    if (clean.startsWith('assets/')) {
        return `${window.location.origin}/${clean}`;
    }
    // /uploads/... => goes through the Express server on 5000
    if (clean.startsWith('uploads/') || pdfPath.startsWith('/uploads/')) {
        return `${SERVER_BASE}/${clean}`;
    }
    // Default: relative path
    return pdfPath;
}

/*=============== GSAP & SCROLLTRIGGER SETUP ===============*/
gsap.registerPlugin(ScrollTrigger);

// Force scroll to top on refresh and disable browser scroll restoration
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Add active preloader class to body to prevent scrollbar interaction
document.body.classList.add("preloader-active");

let lenis = null;

// Helper to split text into spans
function splitTextIntoSpans(selector, initialY = "100%") {
    const element = document.querySelector(selector);
    if (!element) return [];
    const text = element.textContent.trim();
    element.innerHTML = "";
    return text.split("").map(char => {
        const span = document.createElement("span");
        span.style.display = "inline-block";
        span.style.transform = `translateY(${initialY})`;
        span.textContent = char === " " ? "\u00A0" : char;
        element.appendChild(span);
        return span;
    });
}

// -------------------------------------------------------------
// INTRO PRELOADER SCROLL-DRIVEN TIMELINE
// -------------------------------------------------------------
const introLoader = document.getElementById("intro-loader");
const words = gsap.utils.toArray(".intro-loader__word");

// Fade in scroll prompt and progress indicator initially
gsap.to(".intro-loader__scroll", { opacity: 1, duration: 1, delay: 0.5 });
gsap.to(".intro-loader__progress-num", { opacity: 0.8, duration: 0.5, delay: 0.5 });

// Animate preloader marquee rows infinitely in alternating directions
const marqueeTracks = gsap.utils.toArray(".intro-loader__marquee-track");
marqueeTracks.forEach((track, index) => {
    const toLeft = index % 2 === 0;
    if (toLeft) {
        gsap.to(track, {
            xPercent: -50,
            repeat: -1,
            duration: 22 + index * 3,
            ease: "none"
        });
    } else {
        gsap.fromTo(track,
            { xPercent: -50 },
            {
                xPercent: 0,
                repeat: -1,
                duration: 22 + index * 3,
                ease: "none"
            }
        );
    }
});

// Standard timeline for preloader words sequence (scrubbed manually)
const introTl = gsap.timeline({ paused: true });

if (words.length >= 4) {
    introTl
        // Word 1: BUILD
        .to(words[0], { opacity: 1, scale: 1.05, duration: 1, ease: "power1.out" })
        .to(words[0], { opacity: 0, scale: 1.2, duration: 1, ease: "power1.in" }, "+=0.3")

        // Word 2: TRY
        .to(words[1], { opacity: 1, scale: 1.05, duration: 1, ease: "power1.out" })
        .to(words[1], { opacity: 0, scale: 1.2, duration: 1, ease: "power1.in" }, "+=0.3")

        // Word 3: LAUNCH
        .to(words[2], { opacity: 1, scale: 1.05, duration: 1, ease: "power1.out" })
        .to(words[2], { opacity: 0, scale: 1.2, duration: 1, ease: "power1.in" }, "+=0.3")

        // Word 4: ESLAM YASSER
        .to(words[3], { opacity: 1, scale: 1.05, duration: 1, ease: "power1.out" })

        // Hide scroll prompt
        .to(".intro-loader__scroll", { opacity: 0, duration: 0.5 }, 0.2);
}

let virtualProgress = 0;
let introComplete = false;

// Run profession loop continuously and seamlessly without timeline resetting
const runProfessionLoop = () => {
    const el1 = document.querySelector(".home__profession-1");
    const el2 = document.querySelector(".home__profession-2");
    if (!el1 || !el2) return;

    const chars1 = splitTextIntoSpans(".home__profession-1", "0%");
    const chars2 = splitTextIntoSpans(".home__profession-2", "100%");

    if (!chars1.length || !chars2.length) return;

    gsap.set(el1, { opacity: 1 });
    gsap.set(el2, { opacity: 0 });
    gsap.set(chars1, { translateY: "0%" });
    gsap.set(chars2, { translateY: "100%" });

    const cycleTime = 1.4;
    const animDuration = 0.35;

    function animateToNext(currentChars, nextEl, nextChars, onComplete) {
        gsap.timeline({ onComplete })
            .to(currentChars, {
                translateY: "-100%",
                stagger: 0.02,
                duration: animDuration,
                ease: "power2.in"
            })
            .set(nextEl, { opacity: 1 }, "<0.08")
            .to(nextChars, {
                translateY: "0%",
                stagger: 0.02,
                duration: animDuration,
                ease: "power2.out"
            }, "<")
            .set(currentChars, { translateY: "100%" });
    }

    function loop1() {
        gsap.delayedCall(cycleTime, () => {
            animateToNext(chars1, el2, chars2, () => {
                gsap.set(el1, { opacity: 0 });
                loop2();
            });
        });
    }

    function loop2() {
        gsap.delayedCall(cycleTime, () => {
            animateToNext(chars2, el1, chars1, () => {
                gsap.set(el2, { opacity: 0 });
                loop1();
            });
        });
    }

    loop1();
};

// Function to trigger once preloader sequence completes
const finishIntro = () => {
    introComplete = true;

    // Remove virtual scroll event listeners
    window.removeEventListener("wheel", onVirtualScroll);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);

    // Remove the scroll lock class
    document.body.classList.remove("preloader-active");

    // Exit transition of the preloader
    const exitTl = gsap.timeline({
        onComplete: () => {
            // Initialize Lenis Smooth Scroll
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                smoothTouch: false,
            });

            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);

            // Hide loader completely and initialize reveals
            gsap.set("#intro-loader", { display: "none" });
            runProfessionLoop();
            initScrollReveals();
        }
    });

    exitTl
        .to(".intro-loader__bg", { yPercent: -100, duration: 1.2, ease: "power3.inOut" })
        .to(words[3], { yPercent: -100, opacity: 0, duration: 1, ease: "power3.in" }, "<")
        .to(".intro-loader__marquee-container", { yPercent: -100, opacity: 0, duration: 1.2, ease: "power3.inOut" }, "<")
        .to("#intro-loader", { yPercent: -100, duration: 1.2, ease: "power3.inOut" }, "<")

        // Hero Entrance Animations
        .from(".nav__logo, .nav__link", { y: -30, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power2.out" }, "-=0.4")
        .from(".home__greeting", { x: -50, opacity: 0, duration: 0.8, ease: "power2.out" }, "<")
        .from(".home__name", { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5")
        .from(".home__perfil", { scale: 0.85, opacity: 0, duration: 1.2, ease: "power2.out" }, "-=0.8")
        .from(".home__profession-1", { opacity: 0, y: 20, duration: 0.8, ease: "power2.out" }, "-=0.6")
        .from(".home__social-link", { scale: 0, opacity: 0, stagger: 0.08, duration: 0.6, ease: "back.out(1.7)" }, "-=0.6")
        .from(".home__cv", { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6");
};

// Handle virtual scroll
const onVirtualScroll = (e) => {
    if (introComplete) return;

    const direction = e.deltaY > 0 ? 1 : -1;

    if (direction === 1) {
        virtualProgress = Math.min(virtualProgress + 0.12, 1);
    } else {
        virtualProgress = Math.max(virtualProgress - 0.12, 0);
    }

    gsap.to(introTl, {
        progress: virtualProgress,
        duration: 0.4,
        ease: "power1.out",
        onUpdate: () => {
            const currentPercent = Math.round(introTl.progress() * 100);
            gsap.to(".intro-loader__progress-bar", { width: `${currentPercent}%`, duration: 0.1 });
            document.querySelector(".intro-loader__progress-num").textContent = `${currentPercent}%`;
        },
        onComplete: () => {
            if (virtualProgress >= 1 && !introComplete) {
                finishIntro();
            }
        }
    });
};

let touchStartY = 0;
const onTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
};

const onTouchMove = (e) => {
    if (introComplete) return;
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY - touchEndY; // positive = swipe up / scroll down

    if (Math.abs(diff) > 8) {
        const direction = diff > 0 ? 1 : -1;
        virtualProgress = Math.min(Math.max(virtualProgress + direction * 0.08, 0), 1);

        gsap.to(introTl, {
            progress: virtualProgress,
            duration: 0.4,
            ease: "power1.out",
            onUpdate: () => {
                const currentPercent = Math.round(introTl.progress() * 100);
                gsap.to(".intro-loader__progress-bar", { width: `${currentPercent}%`, duration: 0.1 });
                document.querySelector(".intro-loader__progress-num").textContent = `${currentPercent}%`;
            },
            onComplete: () => {
                if (virtualProgress >= 1 && !introComplete) {
                    finishIntro();
                }
            }
        });
        touchStartY = touchEndY;
    }
};

window.addEventListener("wheel", onVirtualScroll);
window.addEventListener("touchstart", onTouchStart, { passive: true });
window.addEventListener("touchmove", onTouchMove, { passive: true });

/*=============== VISITOR TRACKING & ANALYTICS ===============*/
try {
    fetch(`${API_BASE}/analytics/track`, { method: "POST" })
        .catch(err => console.log("Analytics tracking note:", err.message));
} catch (e) { }

/*=============== PROJECTS CARDS ===============*/
const projectsContent = document.getElementById("projects-content");

fetch(`${API_BASE}/projects`)
    .then((response) => {
        if (!response.ok) throw new Error("API not available, fallback to static JSON");
        return response.json();
    })
    .then((result) => {
        const projectsData = result.data ? result.data : result;
        if (!Array.isArray(projectsData) || projectsData.length === 0) {
            throw new Error("API returned empty projects array, fallback to static JSON");
        }
        renderProjects(projectsData);
        initSwiper();
        if (ScrollTrigger) ScrollTrigger.refresh();
    })
    .catch((error) => {
        console.warn("Loading projects from static fallback assets/data/projects.json:", error);
        fetch("assets/data/projects.json")
            .then(res => res.json())
            .then(data => {
                renderProjects(data);
                initSwiper();
                if (ScrollTrigger) ScrollTrigger.refresh();
            });
    });

function renderProjects(projects) {
    window._cachedProjects = projects;
    projectsContent.innerHTML = projects
        .map((project, idx) => {
            const displayId = project.id || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`);
            const hasDemo = project.demo && project.demo.trim() !== '' && project.demo !== '#';
            const hasGithub = project.github && project.github.trim() !== '' && project.github !== '#';

            const coverImage = project.coverImage || project.image || 'assets/img/backend_api.webp';
            const rawGallery = project.gallery || project.images || [];
            const allImages = Array.from(new Set([coverImage, ...rawGallery.filter(Boolean)]));
            const galleryCount = allImages.length;

            // ---- ACTION BUTTONS ----
            const galleryBtn = `<button type="button" onclick="openProjectGallery(${idx})" class="projects__btn projects__btn--gallery" title="View Project Gallery">
                <i class="ri-gallery-line"></i> Gallery (${galleryCount})
            </button>`;

            const liveBtn = hasDemo
                ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="projects__btn projects__btn--live"><i class="ri-global-line"></i> Live Demo</a>`
                : `<span class="projects__btn projects__btn--disabled"><i class="ri-global-line"></i> Live Demo</span>`;

            const githubBtn = hasGithub
                ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="projects__btn projects__btn--github"><i class="ri-github-line"></i> GitHub</a>`
                : `<span class="projects__btn projects__btn--disabled"><i class="ri-github-line"></i> GitHub</span>`;

            // Tech tags
            const techList = Array.isArray(project.technologies) && project.technologies.length > 0
                ? `<div class="projects__tech-tags">${project.technologies.slice(0, 4).map(t => `<span class="proj-tech-tag">${t}</span>`).join('')}</div>`
                : '';

            return `
        <article class="projects__card swiper-slide">
            <div class="blob"></div>
            
            <div class="projects__number">
                <h1>${displayId}</h1>
                <h3>${project.category}</h3>
            </div>
            
            <div class="projects__data">
                <h1 class="projects__title">${project.title}</h1>
                <p class="projects__subtitle">${project.subtitle || ''}</p>
                <p class="projects__description">${project.description}</p>
                ${techList}
            </div>
            
            <div class="projects__image" onclick="openProjectGallery(${idx})" style="cursor: pointer;" title="Click to view image gallery">
                <img src="${coverImage}" alt="${project.title}" 
                     class="projects__img" 
                     width="302" height="180" loading="lazy" decoding="async"
                     onerror="this.src='assets/img/backend_api.webp'">
                <div class="projects__gallery-overlay">
                    <span class="projects__gallery-badge">
                        <i class="ri-gallery-line"></i> ${galleryCount} Photos • View Gallery
                    </span>
                </div>
            </div>

            <div class="projects__buttons" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 1rem;">
                ${galleryBtn}
                ${liveBtn}
                ${githubBtn}
            </div>
        </article>
        `;
        })
        .join('');
}

/*=============== SIMPLE & ROBUST PDF MODAL & DOWNLOAD HANDLERS ===============*/

// Constant direct static path - Canonical Master Resume
const STATIC_CV_PATH = 'assets/pdf/EslamCV.pdf';

/*=============== DYNAMIC ACTIVE CV INITIALIZATION ===============*/
async function initActiveCv() {
    try {
        const res = await fetch(`${API_BASE}/cv/active`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
            const cv = data.data;
            const downloadHref = `${API_BASE}/cv/download`;
            const viewHref = `${API_BASE}/cv/view`;
            const fileName = cv.originalName || cv.name || 'EslamCV.pdf';

            // 1. Home hero CV button
            const homeCvBtn = document.getElementById('home-cv-btn');
            if (homeCvBtn) {
                homeCvBtn.href = downloadHref;
                homeCvBtn.setAttribute('download', fileName);
            }

            // 2. About section preview CV button
            const cvPreviewBtn = document.getElementById('cv-preview-btn');
            if (cvPreviewBtn) {
                cvPreviewBtn.href = viewHref;
                cvPreviewBtn.target = '_blank';
                cvPreviewBtn.rel = 'noopener noreferrer';
            }

            // 3. About section download CV button
            const cvDownloadBtn = document.getElementById('cv-download-btn');
            if (cvDownloadBtn) {
                cvDownloadBtn.href = downloadHref;
                cvDownloadBtn.setAttribute('download', fileName);
            }
        }
    } catch (err) {
        console.warn('Using static CV fallback:', err);
    }
}
initActiveCv();

/**
 * Robust URL resolver for PDF and document assets.
 */
function resolvePdfUrl(rawPath, fileName) {
    const targetName = fileName || 'EslamCV.pdf';
    let pathStr = (rawPath || STATIC_CV_PATH).trim();

    // 1. External / Full URL (Cloudinary, S3, external)
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) {
        return {
            directUrl: pathStr,
            fullDirectUrl: pathStr,
            apiUrl: pathStr,
            downloadUrl: pathStr,
            fileName: targetName
        };
    }

    // Clean relative path
    const clean = pathStr.replace(/^[/\\]+/, '');

    // 2. Static client asset (assets/pdf/...)
    if (clean.startsWith('assets/')) {
        const directUrl = clean;
        const fullDirectUrl = `${window.location.origin}/${clean}`;
        const downloadUrl = clean;
        return { directUrl, fullDirectUrl, apiUrl: downloadUrl, downloadUrl, fileName: targetName };
    }

    // 3. Uploaded server asset (uploads/...)
    if (clean.startsWith('uploads/')) {
        const directUrl = `${SERVER_BASE}/${clean}`;
        const apiUrl = `${API_BASE}/files/download?filePath=${encodeURIComponent(clean)}&name=${encodeURIComponent(targetName)}`;
        return { directUrl, fullDirectUrl: directUrl, apiUrl, downloadUrl: directUrl, fileName: targetName };
    }

    // 4. Default fallback
    return { directUrl: STATIC_CV_PATH, fullDirectUrl: STATIC_CV_PATH, apiUrl: STATIC_CV_PATH, downloadUrl: STATIC_CV_PATH, fileName: targetName };
}

/**
 * Lightweight Non-Intrusive Toast Feedback
 */
function showToast(message, icon = 'ri-information-line') {
    const existing = document.querySelector('.pdf-toast');
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }

    const toast = document.createElement('div');
    toast.className = 'pdf-toast';
    toast.innerHTML = `<i class="${icon}" style="color: var(--first-color); font-size: 1.2rem;"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 2500);
}

/**
 * Direct & Reliable File Downloader
 */
function downloadFile(filePath, fileName) {
    const targetName = fileName || 'EslamCV.pdf';
    let downloadLink = filePath;

    if (!downloadLink || downloadLink === STATIC_CV_PATH) {
        downloadLink = `${API_BASE}/cv/download`;
    } else if (downloadLink.startsWith('http://') || downloadLink.startsWith('https://')) {
        // Keep external URL as is
    } else {
        const clean = downloadLink.replace(/^[/\\]+/, '');
        downloadLink = `${API_BASE}/files/download?filePath=${encodeURIComponent(clean)}&name=${encodeURIComponent(targetName)}`;
    }

    try {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadLink;
        a.download = targetName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            try {
                if (a.parentNode) document.body.removeChild(a);
            } catch (e) {}
        }, 500);
    } catch (err) {
        window.location.href = downloadLink;
    }
}

// Backward-compatible alias
function downloadFileBlob(url, filename) {
    downloadFile(url, filename);
}

/**
 * Direct Native PDF Viewer
 */
function openPdfModal(pdfUrl, title, originalFileName) {
    let targetPath = pdfUrl || `${API_BASE}/cv/view`;
    if (!targetPath.startsWith('http://') && !targetPath.startsWith('https://') && !targetPath.startsWith('/')) {
        targetPath = `/${targetPath}`;
    }
    window.open(targetPath, '_blank', 'noopener,noreferrer');
}

function closePdfModal() {
    // No-op
}

function handleCvView(e) {
    // Let native link handle navigation
}

function handleCvDownload(e) {
    // Let native link handle download
}

function openVideoModal(videoUrl, title) {
    const modal = document.getElementById("video-player-modal");
    const videoEl = document.getElementById("video-modal-element");
    const titleEl = document.getElementById("video-modal-title");

    if (modal && videoEl) {
        titleEl.innerHTML = `<i class="ri-video-line" style="color: var(--first-color);"></i> ${title || 'Video Player'}`;
        videoEl.src = videoUrl;
        modal.style.display = "flex";
        videoEl.play().catch(e => {});
    }
}

/*=============== MULTI-IMAGE GALLERY LIGHTBOX LOGIC ===============*/
let _currentGalleryData = {
    title: '',
    category: '',
    images: [],
    currentIndex: 0,
    demo: '',
    github: ''
};

function openProjectGallery(idx) {
    const projects = window._cachedProjects || [];
    const project = typeof idx === 'number' ? projects[idx] : idx;
    if (!project) return;

    const cover = project.coverImage || project.image || 'assets/img/backend_api.webp';
    const rawGallery = project.gallery || project.images || [];
    const galleryList = [cover, ...rawGallery.filter(img => img && img !== cover)];

    // Deduplicate images array
    const uniqueImages = Array.from(new Set(galleryList.filter(Boolean)));
    if (uniqueImages.length === 0) uniqueImages.push(cover);

    _currentGalleryData = {
        title: project.title || 'Project Showcase',
        category: project.category || 'Project',
        images: uniqueImages,
        currentIndex: 0,
        demo: project.demo || '',
        github: project.github || ''
    };

    renderGalleryModalState();

    const modal = document.getElementById('project-gallery-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleGalleryKeyDown);
    }
}

function renderGalleryModalState() {
    const { title, category, images, currentIndex, demo, github } = _currentGalleryData;
    const total = images.length;
    const currentImg = images[currentIndex] || images[0];

    const titleEl = document.getElementById('gallery-modal-title');
    const catEl = document.getElementById('gallery-modal-category');
    const counterEl = document.getElementById('gallery-modal-counter');
    const mainImg = document.getElementById('gallery-modal-main-img');
    const thumbsContainer = document.getElementById('gallery-modal-thumbs');
    const linksContainer = document.getElementById('gallery-modal-links');
    const prevBtn = document.getElementById('gallery-nav-prev');
    const nextBtn = document.getElementById('gallery-nav-next');

    if (titleEl) titleEl.textContent = title;
    if (catEl) catEl.textContent = category;
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${total}`;

    if (mainImg) {
        mainImg.style.opacity = '0';
        mainImg.src = currentImg;
        mainImg.onload = () => {
            mainImg.style.transition = 'opacity 0.25s ease';
            mainImg.style.opacity = '1';
        };
        mainImg.onerror = () => {
            mainImg.src = 'assets/img/backend_api.webp';
            mainImg.style.opacity = '1';
        };
    }

    // Toggle navigation arrows visibility
    if (prevBtn && nextBtn) {
        prevBtn.style.display = total > 1 ? 'flex' : 'none';
        nextBtn.style.display = total > 1 ? 'flex' : 'none';
    }

    // Render Thumbnails
    if (thumbsContainer) {
        if (total > 1) {
            thumbsContainer.innerHTML = images.map((img, i) => `
                <button type="button" class="gallery-modal__thumb-btn ${i === currentIndex ? 'active' : ''}" 
                    onclick="selectGalleryImage(${i})" aria-label="Photo ${i + 1}">
                    <img src="${img}" alt="Thumbnail ${i + 1}" loading="lazy" onerror="this.src='assets/img/backend_api.webp'">
                </button>
            `).join('');
            thumbsContainer.style.display = 'flex';
        } else {
            thumbsContainer.innerHTML = '';
            thumbsContainer.style.display = 'none';
        }
    }

    // Render Action Links in Modal
    if (linksContainer) {
        let linksHtml = '';
        if (demo && demo.trim() !== '' && demo !== '#') {
            linksHtml += `<a href="${demo}" target="_blank" rel="noopener noreferrer" class="gallery-modal__link-btn gallery-modal__link-btn--live"><i class="ri-global-line"></i> Live Demo</a>`;
        }
        if (github && github.trim() !== '' && github !== '#') {
            linksHtml += `<a href="${github}" target="_blank" rel="noopener noreferrer" class="gallery-modal__link-btn gallery-modal__link-btn--github"><i class="ri-github-line"></i> GitHub Code</a>`;
        }
        linksContainer.innerHTML = linksHtml;
    }
}

function navigateProjectGallery(dir) {
    const total = _currentGalleryData.images.length;
    if (total <= 1) return;
    _currentGalleryData.currentIndex = (_currentGalleryData.currentIndex + dir + total) % total;
    renderGalleryModalState();
}

function selectGalleryImage(idx) {
    if (idx >= 0 && idx < _currentGalleryData.images.length) {
        _currentGalleryData.currentIndex = idx;
        renderGalleryModalState();
    }
}

function closeProjectGallery() {
    const modal = document.getElementById('project-gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleGalleryKeyDown);
    }
}

function handleGalleryKeyDown(e) {
    if (e.key === 'Escape') {
        closeProjectGallery();
        closeLightboxModal();
    } else if (e.key === 'ArrowLeft') {
        navigateProjectGallery(-1);
    } else if (e.key === 'ArrowRight') {
        navigateProjectGallery(1);
    }
}

function openLightboxModal(imageUrl, title) {
    const modal = document.getElementById("image-lightbox-modal");
    const imgEl = document.getElementById("lightbox-modal-img");
    const titleEl = document.getElementById("lightbox-modal-title");

    if (modal && imgEl) {
        if (titleEl) titleEl.innerHTML = `<i class="ri-image-line" style="color: var(--first-color);"></i> ${title || 'Image View'}`;
        imgEl.src = imageUrl;
        modal.style.display = "flex";
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleGalleryKeyDown);
    }
}

function closeLightboxModal() {
    const modal = document.getElementById("image-lightbox-modal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = '';
    }
}

function initSwiper() {
    // Count slides to decide if loop is safe (loop requires more slides than visible)
    const slideCount = document.querySelectorAll('.projects__swiper .swiper-slide').length;
    // Disable loop if fewer than 4 slides to avoid Swiper loop warning
    const enableLoop = slideCount >= 4;

    let swiperProjects = new Swiper(".projects__swiper", {
        loop: enableLoop,
        spaceBetween: 24,
        slidesPerView: "auto",
        grabCursor: true,
        speed: 600,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            dynamicBullets: true,
        },
        autoplay: enableLoop ? {
            delay: 3000,
            disableOnInteraction: false,
        } : false,
    });
}

/*=============== WORK TABS DYNAMIC RENDER ===============*/
const experienceContainer = document.getElementById("experience"),
    educationContainer = document.getElementById("education"),
    volunteeringContainer = document.getElementById("volunteering"),
    certificatesContainer = document.getElementById("certificates-grid") || document.getElementById("certificates");

async function loadAllWorkData() {
    try {
        const [expRes, eduRes, volRes, certRes] = await Promise.all([
            fetch(`${API_BASE}/experience`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${API_BASE}/education`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${API_BASE}/volunteering`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${API_BASE}/certificates`).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        const hasApiData = expRes?.data?.length || eduRes?.data?.length || volRes?.data?.length || certRes?.data?.length;

        if (hasApiData) {
            renderExperienceItems(expRes?.data || [], experienceContainer);
            renderEducationItems(eduRes?.data || [], educationContainer);
            renderVolunteeringItems(volRes?.data || [], volunteeringContainer);
            renderCertificateItems(certRes?.data || [], certificatesContainer);
            initWorkTabs();
            if (ScrollTrigger) ScrollTrigger.refresh();
        } else {
            fallbackToStaticWork();
        }
    } catch (e) {
        fallbackToStaticWork();
    }
}

function fallbackToStaticWork() {
    fetch("assets/data/work.json")
        .then((response) => response.json())
        .then((data) => {
            renderWorkItems(data.experience, experienceContainer);
            renderWorkItems(data.education, educationContainer);
            renderWorkItems(data.volunteering, volunteeringContainer);
            renderCertificateItems(data.certificates, certificatesContainer);
            initWorkTabs();
            if (ScrollTrigger) ScrollTrigger.refresh();
        })
        .catch((error) => console.error("Error loading work data:", error));
}

loadAllWorkData();

function renderExperienceItems(items, container) {
    if (!container || !items) return;
    container.innerHTML = items
        .map((item) => {
            const dateStr = `${item.startDate} - ${item.current ? 'Present' : (item.endDate || 'Present')}`;
            const certBtn = item.certificateFile
                ? `<button onclick="openPdfModal('${item.certificateFile}', '${item.title.replace(/'/g, "\\'")}', '${(item.certificateOriginalName || item.title + '.pdf').replace(/'/g, "\\'")}')" class="work__link-btn"><i class="ri-file-pdf-2-line"></i> View Proof</button>`
                : '';
            return `
        <div class="work__card">
            <div class="work__data">
                <div>
                    <h1 class="work__title">${item.title}</h1>
                    <h3 class="work__subtitle">${item.company} ${item.location ? `• ${item.location}` : ''}</h3>
                </div>
                <h2 class="work__year">${dateStr}</h2>
            </div>
            <p class="work__description">${item.description || ''}</p>
            ${certBtn ? `<div class="work__link-wrapper">${certBtn}</div>` : ''}
        </div>`;
        }).join("");
}

function renderEducationItems(items, container) {
    if (!container || !items) return;
    container.innerHTML = items
        .map((item) => {
            const dateStr = `${item.startDate} - ${item.endDate || 'Present'}`;
            return `
        <div class="work__card">
            <div class="work__data">
                <div>
                    <h1 class="work__title">${item.degree}</h1>
                    <h3 class="work__subtitle">${item.institution} ${item.gpa ? `(GPA: ${item.gpa})` : ''}</h3>
                </div>
                <h2 class="work__year">${dateStr}</h2>
            </div>
            <p class="work__description">${item.description || ''}</p>
        </div>`;
        }).join("");
}

function renderVolunteeringItems(items, container) {
    if (!container || !items) return;
    container.innerHTML = items
        .map((item) => {
            const dateStr = `${item.startDate} - ${item.endDate || 'Present'}`;
            return `
        <div class="work__card">
            <div class="work__data">
                <div>
                    <h1 class="work__title">${item.role}</h1>
                    <h3 class="work__subtitle">${item.organization} ${item.location ? `• ${item.location}` : ''}</h3>
                </div>
                <h2 class="work__year">${dateStr}</h2>
            </div>
            <p class="work__description">${item.description || ''}</p>
        </div>`;
        }).join("");
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function isImageResource(url) {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim().toLowerCase().split('?')[0].split('#')[0];
    if (clean.startsWith('data:image/')) return true;
    if (clean.includes('/image/upload/')) return true;
    if (clean.includes('/uploads/images/')) return true;
    if (/\.(png|jpe?g|webp|gif|svg|avif|bmp|ico)$/i.test(clean)) return true;
    return false;
}

function isPdfResource(url) {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim().toLowerCase().split('?')[0].split('#')[0];
    if (clean.startsWith('data:application/pdf')) return true;
    if (clean.includes('/raw/upload/') && clean.endsWith('.pdf')) return true;
    if (clean.includes('/uploads/certificates/') && clean.endsWith('.pdf')) return true;
    if (clean.includes('/assets/pdf/')) return true;
    if (/\.pdf$/i.test(clean)) return true;
    return false;
}

function generateCertificateSvg(item) {
    if (!item) return '';
    const title = item.name || item.title || "Certification of Completion";
    const issuer = item.issuer || item.subtitle || "Authorized Issuer";
    const date = item.issueDate || item.year || "2026";
    const credId = item.credentialId || "VERIFIED";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">
      <defs>
        <linearGradient id="cbg_${credId.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0d1b30"/>
          <stop offset="100%" stop-color="#040a14"/>
        </linearGradient>
        <linearGradient id="cborder_${credId.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4db2ff"/>
          <stop offset="100%" stop-color="#0066cc"/>
        </linearGradient>
      </defs>
      <rect width="600" height="420" rx="14" fill="url(#cbg_${credId.replace(/[^a-zA-Z0-9]/g, '')})"/>
      <rect x="14" y="14" width="572" height="392" rx="10" fill="none" stroke="url(#cborder_${credId.replace(/[^a-zA-Z0-9]/g, '')})" stroke-width="2" stroke-opacity="0.5"/>
      <rect x="20" y="20" width="560" height="380" rx="8" fill="none" stroke="#4db2ff" stroke-width="1" stroke-dasharray="5,4" stroke-opacity="0.3"/>
      
      <circle cx="300" cy="70" r="26" fill="#0d243f" stroke="#4db2ff" stroke-width="2"/>
      <polygon points="300,52 305,66 320,66 308,75 312,90 300,80 288,90 292,75 280,66 295,66" fill="#4db2ff"/>
      
      <text x="300" y="118" text-anchor="middle" fill="#80c8ff" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="3">CERTIFICATE OF ACHIEVEMENT</text>
      <text x="300" y="145" text-anchor="middle" fill="#7a92b2" font-family="sans-serif" font-size="11">PROUDLY PRESENTED TO</text>
      
      <text x="300" y="185" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="800" letter-spacing="1">ESLAM YASSER</text>
      <line x1="180" y1="198" x2="420" y2="198" stroke="#4db2ff" stroke-width="1.5" stroke-opacity="0.6"/>
      
      <text x="300" y="235" text-anchor="middle" fill="#4db2ff" font-family="sans-serif" font-size="15" font-weight="700">${escapeXml(title)}</text>
      <text x="300" y="260" text-anchor="middle" fill="#9cb2ce" font-family="sans-serif" font-size="12">Issued by: ${escapeXml(issuer)}</text>
      
      <text x="45" y="370" text-anchor="start" fill="#526a88" font-family="monospace" font-size="11">ID: ${escapeXml(credId)}</text>
      <text x="555" y="370" text-anchor="end" fill="#526a88" font-family="sans-serif" font-size="11">Date: ${escapeXml(date)}</text>
      
      <circle cx="300" cy="340" r="22" fill="#0a1d33" stroke="#4db2ff" stroke-width="1.5"/>
      <text x="300" y="344" text-anchor="middle" fill="#4db2ff" font-family="sans-serif" font-size="8" font-weight="bold">OFFICIAL</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getCertificateVisual(item) {
    if (!item) return '';

    // Direct image properties
    if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
        return item.image.trim();
    }
    if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
        return item.imageUrl.trim();
    }

    // Check if pdfFile / fileUrl / certificateFile / filePath / thumbnail / link contains an image URL
    const candidates = [
        item.thumbnail,
        item.previewUrl,
        item.pdfFile,
        item.fileUrl,
        item.certificateFile,
        item.filePath,
        item.link
    ];

    for (const c of candidates) {
        if (c && typeof c === 'string' && c.trim() !== '' && isImageResource(c)) {
            return c.trim();
        }
    }

    return generateCertificateSvg(item);
}

let currentCertificatesList = [];

function handleCertImgError(img, idx) {
    if (!img) return;
    img.onerror = null;
    const item = currentCertificatesList && currentCertificatesList[idx];
    if (item) {
        img.src = generateCertificateSvg(item);
    }
}

function renderCertificateItems(items, container) {
    const targetContainer = container || document.getElementById("certificates-grid") || document.getElementById("certificates");
    if (!targetContainer || !items || !items.length) return;

    currentCertificatesList = items;

    targetContainer.innerHTML = items
        .map((item, idx) => {
            const title = item.name || item.title || "Certificate";
            const issuer = item.issuer || item.subtitle || "Issuer";
            const issueDate = item.issueDate || item.year || "";
            const duration = item.duration || "Verified Credential";
            const credentialId = item.credentialId || (item._id ? item._id.substring(0, 10).toUpperCase() : `CERT-${idx + 101}`);

            let skillsArr = [];
            if (Array.isArray(item.skills)) {
                skillsArr = item.skills;
            } else if (typeof item.skills === 'string' && item.skills.trim()) {
                skillsArr = item.skills.split(',').map(s => s.trim());
            } else {
                skillsArr = ["Software Engineering", "Problem Solving"];
            }
            const skillsHtml = skillsArr.slice(0, 3).map(s => `<span class="cert-skill-tag">${escapeXml(s)}</span>`).join("");

            const issuerLower = issuer.toLowerCase();
            const logo = item.issuerLogo || (
                issuerLower.includes("aws") || issuerLower.includes("amazon") ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" :
                issuerLower.includes("google") ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" :
                issuerLower.includes("python") ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" :
                issuerLower.includes("c++") || issuerLower.includes("icpc") ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" :
                issuerLower.includes("udemy") ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-plain.svg" :
                issuerLower.includes("nti") ? "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" :
                ""
            );

            const certVisual = getCertificateVisual(item);
            const isUploadedImage = isImageResource(certVisual) || (item.image && item.image.trim() !== '');
            const rawFile = item.pdfFile || item.fileUrl || item.certificateFile || item.filePath || "";
            const isPdf = !isUploadedImage && isPdfResource(rawFile);
            const verifyLink = item.link || item.verifyUrl || "";

            return `
        <div class="cert-card" data-idx="${idx}" tabindex="0" role="region" aria-label="Certificate: ${escapeXml(title)}">
            <div class="cert-card__inner">
                <!-- FRONT FACE (All details live here) -->
                <div class="cert-card__face cert-card__face--front">
                    <div class="cert-front__header">
                        <span class="cert-front__badge">
                            <i class="ri-shield-check-fill"></i> Verified Credential
                        </span>
                        ${logo ? `
                        <img src="${logo}" alt="${escapeXml(issuer)} logo" class="cert-front__logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="cert-front__logo-fallback" style="display:none;"><i class="ri-award-line"></i></div>
                        ` : `
                        <div class="cert-front__logo-fallback"><i class="ri-award-line"></i></div>
                        `}
                    </div>

                    <div class="cert-front__body">
                        <h3 class="cert-front__title">${escapeXml(title)}</h3>
                        <p class="cert-front__issuer"><i class="ri-building-line"></i> ${escapeXml(issuer)}</p>

                        <div class="cert-front__meta-grid">
                            <div class="cert-front__meta-item">
                                <span class="cert-meta-label">Duration</span>
                                <span class="cert-meta-value"><i class="ri-time-line"></i> ${escapeXml(duration)}</span>
                            </div>
                            <div class="cert-front__meta-item">
                                <span class="cert-meta-label">Date</span>
                                <span class="cert-meta-value"><i class="ri-calendar-line"></i> ${escapeXml(issueDate)}</span>
                            </div>
                            <div class="cert-front__meta-item cert-front__meta-item--full">
                                <span class="cert-meta-label">Credential ID</span>
                                <span class="cert-meta-value font-mono">${escapeXml(credentialId)}</span>
                            </div>
                        </div>

                        <div class="cert-front__skills">
                            ${skillsHtml}
                        </div>
                    </div>

                    <div class="cert-front__footer">
                        <span class="cert-front__hint">
                            <i class="ri-image-line"></i> View Certificate
                        </span>
                        <span class="cert-front__flip-icon">
                            <i class="ri-arrow-left-right-line"></i>
                        </span>
                    </div>
                </div>

                <!-- BACK FACE (Dedicated purely to the Certificate Image) -->
                <div class="cert-card__face cert-card__face--back" data-idx="${idx}">
                    <div class="cert-back__image-wrapper">
                        <img src="${escapeXml(certVisual)}" alt="${escapeXml(title)}" class="cert-back__image" loading="lazy" onerror="handleCertImgError(this, ${idx})">
                        
                        <div class="cert-back__overlay">
                            <span class="cert-back__zoom-tag">
                                <i class="ri-${isPdf ? 'file-pdf-line' : 'zoom-in-line'}"></i> ${isPdf ? 'View PDF' : 'Fullscreen'}
                            </span>
                        </div>

                        <div class="cert-back__controls">
                            ${verifyLink && verifyLink !== '#' ? `
                            <a href="${escapeXml(verifyLink)}" target="_blank" rel="noopener noreferrer" class="cert-back__verify-link" title="Verify Online">
                                <i class="ri-external-link-line"></i>
                            </a>` : ''}
                            <button type="button" class="cert-btn--flip-back" aria-label="Flip back" onclick="flipBackCard(this)">
                                <i class="ri-arrow-go-back-line"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        }).join("");

    attachCertInteractions(items);
}

function attachCertInteractions(items) {
    const list = items || currentCertificatesList;
    const cards = document.querySelectorAll(".cert-card");
    cards.forEach((card) => {
        const idx = parseInt(card.getAttribute("data-idx"), 10);
        const item = list && list[idx] ? list[idx] : null;

        const backFace = card.querySelector(".cert-card__face--back");
        if (backFace && item) {
            backFace.addEventListener("click", (e) => {
                if (e.target.closest(".cert-back__controls, .cert-btn--flip-back, a")) return;
                
                const title = item.name || item.title || "Certificate";
                const certVisual = getCertificateVisual(item);
                const isUploadedImage = isImageResource(certVisual) || (item.image && item.image.trim() !== '');
                const rawFile = item.pdfFile || item.fileUrl || item.certificateFile || item.filePath || "";
                const isPdf = !isUploadedImage && isPdfResource(rawFile);
                const originalName = item.originalPdfName || `${title}.pdf`;
                const verifyLink = item.link || item.verifyUrl || "";

                if (isUploadedImage) {
                    openLightboxModal(certVisual, title);
                } else if (isPdf) {
                    openPdfModal(rawFile, title, originalName);
                } else if (verifyLink && verifyLink !== "#" && !verifyLink.includes("example.com")) {
                    window.open(verifyLink, "_blank", "noopener,noreferrer");
                } else {
                    openLightboxModal(certVisual, title);
                }
            });
        }

        card.addEventListener("click", (e) => {
            if (e.target.closest("a, button, .cert-card__face--back, .cert-back__controls")) return;
            card.classList.toggle("is-flipped");
        });

        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                if (e.target.tagName !== "BUTTON" && e.target.tagName !== "A") {
                    e.preventDefault();
                    card.classList.toggle("is-flipped");
                }
            }
        });
    });
}

function flipBackCard(button) {
    const card = button.closest(".cert-card");
    if (card) card.classList.remove("is-flipped");
}

function renderWorkItems(items, container) {
    if (!container || !items) return;
    container.innerHTML = items
        .map((item) => {
            const hasLink = item.link && item.link.trim() !== "" && item.link !== "#";
            const linkBtn = hasLink
                ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="work__link-btn"><i class="ri-external-link-line"></i> View Credential</a>`
                : '';

            return `
        <div class="work__card">
            <div class="work__data">
                <div>
                    <h1 class="work__title">${item.title}</h1>
                    <h3 class="work__subtitle">${item.subtitle}</h3>
                </div>
                <h2 class="work__year">${item.year}</h2>
            </div>
            <p class="work__description">${item.description}</p>
            ${linkBtn ? `<div class="work__link-wrapper">${linkBtn}</div>` : ''}
        </div>
    `;
        })
        .join("");
}

function initWorkTabs() {
    const tabs = document.querySelectorAll("[data-target]"),
        tabContents = document.querySelectorAll("[data-content]"),
        blob = document.querySelector(".work__blob");

    if (!blob) return;

    const updateBlob = (tab) => {
        if (!tab) return;
        blob.style.left = `${tab.offsetLeft}px`;
        blob.style.width = `${tab.offsetWidth}px`;
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = document.querySelector(tab.dataset.target);

            tabContents.forEach((tc) => tc.classList.remove("work-active"));
            if (target) target.classList.add("work-active");

            tabs.forEach((t) => t.classList.remove("work-active"));
            tab.classList.add("work-active");

            updateBlob(tab);
            if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh(); // Refresh ScrollTrigger in case tab height changes
        });
    });

    const updateActiveBlob = () => {
        const activeTab = document.querySelector(".work__button.work-active");
        if (activeTab) updateBlob(activeTab);
    };

    setTimeout(updateActiveBlob, 100);
    window.addEventListener("resize", updateActiveBlob);
}

/*=============== SERVICES DYNAMIC RENDER ===============*/
const servicesContent = document.getElementById("services-content");

fetch("assets/data/services.json")
    .then((response) => response.json())
    .then((data) => {
        renderServices(data);
        initServicesAccordion();
        if (ScrollTrigger) ScrollTrigger.refresh(); // Refresh ScrollTrigger after dynamic content load
    })
    .catch((error) => console.error("Error loading services:", error));

function renderServices(services) {
    if (!servicesContent) return;
    servicesContent.innerHTML = services
        .map(
            (service, index) => `
    <article class="services__card ${index === 0 ? "services-open" : "services-close"}">
       <div class="blob"></div>

       <div class="services__data">
          <i class="${service.icon} services__icon"></i> 
          <h2 class="services__title">${service.title}</h2>
          <p class="services__description">${service.description}</p>
       </div>

       <div class="services__info" style="height: ${index === 0 ? "auto" : "0"}">
          <h3 class="services__subtitle">${service.subtitle}</h3>
          <ul class="services__skills">
             ${service.skills.map((skill) => `<li class="services__skill">${skill}</li>`).join("")}
          </ul>
       </div>

       <button class="services__button">
          <i class="ri-arrow-down-s-line"></i>
       </button>
    </article>
  `,
        )
        .join("");
}

function initServicesAccordion() {
    const servicesCards = document.querySelectorAll(".services__card");

    servicesCards.forEach((card) => {
        const button = card.querySelector(".services__button");
        const info = card.querySelector(".services__info");

        if (card.classList.contains("services-open")) {
            info.style.height = info.scrollHeight + "px";
        }

        button.addEventListener("click", () => {
            const isOpen = card.classList.contains("services-open");

            servicesCards.forEach((otherCard) => {
                otherCard.classList.replace("services-open", "services-close");
                otherCard.querySelector(".services__info").style.height = "0";
            });

            if (!isOpen) {
                card.classList.replace("services-close", "services-open");
                info.style.height = info.scrollHeight + "px";
            }
            if (ScrollTrigger) {
                setTimeout(() => ScrollTrigger.refresh(), 300); // Refresh ScrollTrigger after transition finishes
            }
        });
    });
}

/*=============== TESTIMONIALS DYNAMIC RENDER & CAROUSEL ===============*/
const testimonialsTrack = document.getElementById("testimonials-track");
const testimonialsDots = document.getElementById("testimonials-dots");
const prevTestimonialBtn = document.getElementById("testimonials-prev");
const nextTestimonialBtn = document.getElementById("testimonials-next");

let _testimonialsList = [];
let _currentTestimonialIndex = 0;
let _testimonialAutoPlayTimer = null;

async function loadTestimonials() {
    try {
        const res = await fetch(`${API_BASE}/testimonials`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) {
                _testimonialsList = data.data;
                renderTestimonials(_testimonialsList);
                return;
            }
        }
        fallbackToStaticTestimonials();
    } catch (e) {
        fallbackToStaticTestimonials();
    }
}

function fallbackToStaticTestimonials() {
    fetch("assets/data/testimonials.json")
        .then(r => r.json())
        .then(data => {
            _testimonialsList = data;
            renderTestimonials(_testimonialsList);
        })
        .catch(err => console.warn("Error loading testimonials fallback:", err));
}

function getAuthorInitials(name) {
    if (!name) return "EY";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function renderTestimonials(testimonials) {
    if (!testimonialsTrack || !testimonials || testimonials.length === 0) return;

    testimonialsTrack.innerHTML = testimonials.map((t, idx) => {
        const rating = Math.min(5, Math.max(1, t.rating || 5));
        const starsHtml = Array.from({ length: 5 }, (_, i) => 
            `<i class="${i < rating ? 'ri-star-fill' : 'ri-star-line'}"></i>`
        ).join('');

        const platform = t.platform || 'LinkedIn';
        const platformClass = platform.toLowerCase();
        const initials = getAuthorInitials(t.name);

        const avatarHtml = t.avatar && t.avatar.trim() !== ''
            ? `<img src="${t.avatar}" alt="${t.name}" class="testimonial__avatar" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="testimonial__avatar-placeholder" style="display: none;">${initials}</div>`
            : `<div class="testimonial__avatar-placeholder">${initials}</div>`;

        const screenshotHtml = t.screenshotUrl && t.screenshotUrl.trim() !== ''
            ? `<div class="testimonial__screenshot-thumb" onclick="openTestimonialScreenshot('${t.screenshotUrl}', '${t.name.replace(/'/g, "\\'")}')">
                 <img src="${t.screenshotUrl}" alt="Proof screenshot from ${t.name}" loading="lazy">
                 <div class="testimonial__screenshot-overlay"><i class="ri-zoom-in-line"></i> View Proof</div>
               </div>`
            : '';

        return `
            <article class="testimonial__card" data-index="${idx}">
                <div class="testimonial__quote-watermark">“</div>
                
                <div class="testimonial__top">
                    <div class="testimonial__stars" aria-label="${rating} out of 5 stars">${starsHtml}</div>
                    <span class="testimonial__platform-badge ${platformClass}">
                        <i class="ri-checkbox-circle-fill"></i> ${platform}
                    </span>
                </div>

                <div class="testimonial__content">
                    <p>“${t.content}”</p>
                    ${screenshotHtml}
                </div>

                <div class="testimonial__author">
                    ${avatarHtml}
                    <div class="testimonial__author-info">
                        <h4 class="testimonial__author-name">${t.name}</h4>
                        <span class="testimonial__author-role">${t.role}</span>
                        ${t.company ? `<span class="testimonial__author-company">${t.company}</span>` : ''}
                    </div>
                </div>
            </article>
        `;
    }).join('');

    initTestimonialsCarousel();
    if (ScrollTrigger) ScrollTrigger.refresh();
}

function getCardsPerView() {
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 1024) return 2;
    return 3;
}

function getMaxTestimonialIndex() {
    const perView = getCardsPerView();
    return Math.max(0, _testimonialsList.length - perView);
}

function updateTestimonialCarouselPosition() {
    if (!testimonialsTrack || _testimonialsList.length === 0) return;

    const cards = testimonialsTrack.querySelectorAll('.testimonial__card');
    if (!cards || cards.length === 0) return;

    const perView = getCardsPerView();
    const maxIdx = getMaxTestimonialIndex();

    if (_currentTestimonialIndex > maxIdx) {
        _currentTestimonialIndex = maxIdx;
    }

    const cardWidth = cards[0].offsetWidth;
    const gap = 24; // 1.5rem = 24px
    const offset = _currentTestimonialIndex * (cardWidth + gap);

    testimonialsTrack.style.transform = `translateX(-${offset}px)`;

    // Update Dots
    if (testimonialsDots) {
        const dotCount = maxIdx + 1;
        testimonialsDots.innerHTML = Array.from({ length: dotCount }, (_, i) => `
            <button class="testimonial-dot ${i === _currentTestimonialIndex ? 'active' : ''}" 
                onclick="goToTestimonialSlide(${i})" 
                aria-label="Go to testimonial slide ${i + 1}">
            </button>
        `).join('');
    }

    // Update button states
    if (prevTestimonialBtn) prevTestimonialBtn.disabled = _currentTestimonialIndex === 0;
    if (nextTestimonialBtn) nextTestimonialBtn.disabled = _currentTestimonialIndex >= maxIdx;
}

function goToTestimonialSlide(index) {
    const maxIdx = getMaxTestimonialIndex();
    _currentTestimonialIndex = Math.max(0, Math.min(index, maxIdx));
    updateTestimonialCarouselPosition();
}

function prevTestimonial() {
    if (_currentTestimonialIndex > 0) {
        _currentTestimonialIndex--;
    } else {
        _currentTestimonialIndex = getMaxTestimonialIndex();
    }
    updateTestimonialCarouselPosition();
}

function nextTestimonial() {
    const maxIdx = getMaxTestimonialIndex();
    if (_currentTestimonialIndex < maxIdx) {
        _currentTestimonialIndex++;
    } else {
        _currentTestimonialIndex = 0;
    }
    updateTestimonialCarouselPosition();
}

function startTestimonialAutoPlay() {
    stopTestimonialAutoPlay();
    _testimonialAutoPlayTimer = setInterval(() => {
        nextTestimonial();
    }, 5000);
}

function stopTestimonialAutoPlay() {
    if (_testimonialAutoPlayTimer) {
        clearInterval(_testimonialAutoPlayTimer);
        _testimonialAutoPlayTimer = null;
    }
}

function openTestimonialScreenshot(url, authorName) {
    const modal = document.getElementById("image-lightbox-modal");
    const img = document.getElementById("lightbox-modal-img");
    const titleEl = document.getElementById("lightbox-modal-title");
    const dlBtn = document.getElementById("lightbox-modal-download-btn");

    if (modal && img) {
        img.src = url;
        if (titleEl) titleEl.innerHTML = `<i class="ri-shield-check-line text-primary"></i> Recommendation Proof — ${authorName}`;
        if (dlBtn) dlBtn.href = url;
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function initTestimonialsCarousel() {
    _currentTestimonialIndex = 0;
    updateTestimonialCarouselPosition();

    if (prevTestimonialBtn) {
        prevTestimonialBtn.onclick = () => {
            prevTestimonial();
            startTestimonialAutoPlay();
        };
    }
    if (nextTestimonialBtn) {
        nextTestimonialBtn.onclick = () => {
            nextTestimonial();
            startTestimonialAutoPlay();
        };
    }

    const windowEl = document.getElementById("testimonials-window");
    if (windowEl) {
        windowEl.onmouseenter = stopTestimonialAutoPlay;
        windowEl.onmouseleave = startTestimonialAutoPlay;

        // Touch Swipe
        let startX = 0;
        let diffX = 0;

        windowEl.addEventListener("touchstart", (e) => {
            stopTestimonialAutoPlay();
            startX = e.touches[0].clientX;
            diffX = 0;
        }, { passive: true });

        windowEl.addEventListener("touchmove", (e) => {
            diffX = e.touches[0].clientX - startX;
        }, { passive: true });

        windowEl.addEventListener("touchend", () => {
            if (Math.abs(diffX) > 50) {
                if (diffX < 0) {
                    nextTestimonial();
                } else {
                    prevTestimonial();
                }
            }
            startTestimonialAutoPlay();
        });
    }

    window.addEventListener("resize", () => {
        updateTestimonialCarouselPosition();
    });

    startTestimonialAutoPlay();
}

// Kick off loading testimonials
loadTestimonials();

/*=============== COPY CONTACT EMAIL ===============*/
const copyBtn = document.getElementById("contact-btn");
if (copyBtn) {
    copyBtn.addEventListener("click", () => {
        const copyEmail = document.getElementById("contact-email").textContent;
        navigator.clipboard.writeText(copyEmail).then(() => {
            // Temporarily change copy icon class or style
            const copyIcon = copyBtn.querySelector(".contact__copy-icon");
            if (copyIcon) {
                copyIcon.className = "ri-check-line contact__copy-icon";
                setTimeout(() => {
                    copyIcon.className = "ri-file-copy-line contact__copy-icon";
                }, 2000);
            }
        });
    });
}

/*=============== CONTACT FORM SUBMIT (BACKEND API /api/inquiries) ===============*/
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("contact-name-input").value;
        const email = document.getElementById("contact-email-input").value;
        const message = document.getElementById("contact-message-input").value;
        const honeypot = document.getElementById("contact-hp") ? document.getElementById("contact-hp").value : "";
        const submitBtn = contactForm.querySelector(".contact__form-button");

        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `Sending... <i class="ri-loader-4-line animate-spin"></i>`;
        submitBtn.disabled = true;

        fetch(`${API_BASE}/inquiries`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                subject: `New Inquiry from ${name}`,
                _website_url: honeypot
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    submitBtn.innerHTML = `Sent Successfully! <i class="ri-check-line"></i>`;
                    submitBtn.style.backgroundColor = "hsl(140, 60%, 40%)";
                    contactForm.reset();

                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnContent;
                        submitBtn.style.backgroundColor = "";
                        submitBtn.disabled = false;
                    }, 4000);
                } else {
                    alert(data.message || "Failed to send message.");
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.warn("Backend API inquiry error, sending via fallback:", error);
                // Fallback to formsubmit if local server endpoint unavailable
                fetch("https://formsubmit.co/ajax/eslam9076460@gmail.com", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ name, email, message, _captcha: "false" })
                })
                .then(res => res.json())
                .then(resData => {
                    submitBtn.innerHTML = `Sent Successfully! <i class="ri-check-line"></i>`;
                    submitBtn.style.backgroundColor = "hsl(140, 60%, 40%)";
                    contactForm.reset();
                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnContent;
                        submitBtn.style.backgroundColor = "";
                        submitBtn.disabled = false;
                    }, 4000);
                });
            });
    });
}

/*=============== CURRENT YEAR OF THE FOOTER ===============*/
const textYear = document.getElementById("footer-year");
if (textYear) {
    textYear.textContent = new Date().getFullYear();
}

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
    const scrollY = window.scrollY;

    sections.forEach((section) => {
        const id = section.id,
            top = section.offsetTop - 150,
            height = section.offsetHeight,
            link = document.querySelector(".nav__menu a[href*=" + id + "]");
        if (!link) return;

        link.classList.toggle(
            "active-link",
            scrollY > top && scrollY <= top + height,
        );
    });
};
window.addEventListener("scroll", scrollActive);

/*=============== CUSTOM CURSOR ===============*/
const cursor = document.querySelector(".cursor");
if (cursor) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

    const xt1 = gsap.quickTo(".cursor-trail-1", "x", { duration: 0.35, ease: "power2" });
    const yt1 = gsap.quickTo(".cursor-trail-1", "y", { duration: 0.35, ease: "power2" });
    const xt2 = gsap.quickTo(".cursor-trail-2", "x", { duration: 0.5, ease: "power2" });
    const yt2 = gsap.quickTo(".cursor-trail-2", "y", { duration: 0.5, ease: "power2" });

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    window.addEventListener("mousemove", (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
        xt1(e.clientX);
        yt1(e.clientY);
        xt2(e.clientX);
        yt2(e.clientY);
    });

    // Dynamic Event Delegation for Cursor hover animations
    document.addEventListener("mouseover", (e) => {
        const target = e.target.closest("a, button, .swiper-pagination-bullet, .work__button, .services__button, .contact__email-wrapper");
        if (target) {
            gsap.to(cursor, {
                scale: 2.2,
                backgroundColor: "transparent",
                border: "1.5px solid var(--first-color)",
                mixBlendMode: "normal",
                duration: 0.3
            });
            gsap.to(".cursor-trail", { opacity: 0, duration: 0.2 });
        }
    });

    document.addEventListener("mouseout", (e) => {
        const target = e.target.closest("a, button, .swiper-pagination-bullet, .work__button, .services__button, .contact__email-wrapper");
        if (target) {
            gsap.to(cursor, {
                scale: 1,
                backgroundColor: "var(--first-color)",
                border: "0px solid transparent",
                mixBlendMode: "difference",
                duration: 0.3
            });
            gsap.to(".cursor-trail-1", { opacity: 0.15, duration: 0.2 });
            gsap.to(".cursor-trail-2", { opacity: 0.1, duration: 0.2 });
        }
    });
}

/*=============== TECH SCROLL (JSON) ===============*/
const techLeft = document.getElementById("tech-left");
const techRight = document.getElementById("tech-right");

fetch("assets/data/techScroll.json")
    .then((res) => res.json())
    .then((data) => {
        renderTech(data);
        if (ScrollTrigger) ScrollTrigger.refresh(); // Refresh ScrollTrigger after dynamic content load
    })
    .catch((err) => console.error("Error loading tech:", err));

function renderTech(techs) {
    if (!techLeft || !techRight) return;

    const half = Math.ceil(techs.length / 2);
    const firstRow = techs.slice(0, half);
    const secondRow = techs.slice(half);
    const generateTrack = (items) => {
        const content = items
            .map(
                (item) => `
      <img src="${item.image}" alt="${item.name}" width="60" height="60" loading="lazy">
    `,
            )
            .join("");

        return content + content;
    };

    techLeft.innerHTML = generateTrack(firstRow);
    techRight.innerHTML = generateTrack(secondRow);
}

/*=============== CONTINUOUS FLOATING PROFILE LOOP ===============*/
const runProfileFloat = () => {
    const profile = document.querySelector(".home__perfil");
    if (!profile) return;
    gsap.to(profile, {
        y: -12,
        rotation: 1,
        duration: 3.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
    });
};

/*=============== MAGNETIC HOVER EFFECT ===============*/
const initMagnetic = () => {
    const targets = document.querySelectorAll(".home__social-link, .home__cv, #contact-btn, .nav__toggle, .contact__form-button, .scrollup");
    targets.forEach((elem) => {
        elem.addEventListener("mousemove", (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(elem, {
                x: x * 0.45,
                y: y * 0.45,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        elem.addEventListener("mouseleave", () => {
            gsap.to(elem, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
};

/*=============== 3D TILT EFFECT ===============*/
const init3DTilt = () => {
    const cards = document.querySelectorAll(".skills__card, .services__card");
    cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xc = x / rect.width - 0.5;
            const yc = y / rect.height - 0.5;

            const maxRot = 10;

            gsap.to(card, {
                rotateX: -yc * maxRot,
                rotateY: xc * maxRot,
                scale: 1.025,
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.35)",
                duration: 0.4,
                ease: "power2.out"
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                boxShadow: "none",
                duration: 0.6,
                ease: "power2.out"
            });
        });
    });
};

/*=============== INTERACTIVE PARTICLES CANVAS ===============*/
let _particleCanvasInitialized = false;
const initParticleCanvas = () => {
    if (_particleCanvasInitialized) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // Disable particle physics on reduced motion preference
    }
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    _particleCanvasInitialized = true;
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        const numParticles = Math.min(Math.floor((canvas.width * canvas.height) / 16000), 80);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    };

    window.addEventListener("resize", handleResize);

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 10;
            this.color = `rgba(77, 166, 255, ${Math.random() * 0.12 + 0.04})`; // Glowing transparent electric blue
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            this.baseY -= 0.2;
            if (this.baseY < 0) {
                this.baseY = canvas.height;
                this.x = Math.random() * canvas.width;
                this.baseX = this.x;
            }

            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 15;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 15;
                    }
                }
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 15;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 15;
                }
            }
        }
    }

    handleResize();

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    };

    animate();
};

/*=============== DIGITAL SCRAMBLE TEXT EFFECT (ROCK-SOLID & RESILIENT) ===============*/
// WeakMap to store pristine text for text nodes to prevent corruption on multiple triggers/fast scroll
const _pristineTextMap = new WeakMap();
// WeakMap to track active animation cleanup functions per element
const _activeScrambleMap = new WeakMap();

const scrambleTextNode = (node) => {
    // 1. Get or cache the absolute pristine text for this node
    let originalText = _pristineTextMap.get(node);
    if (!originalText) {
        originalText = node.nodeValue || "";
        _pristineTextMap.set(node, originalText);
    }

    if (!originalText || !originalText.trim()) {
        return () => {};
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$%#@*&?-+=^![]{}/~0123456789";
    const textLen = originalText.length;
    let iteration = 0;
    let isFinished = false;

    // Hard fail-safe: forcibly restore true text if anything hangs or after max 1.5 seconds
    const safetyTimeout = setTimeout(() => {
        if (!isFinished) {
            isFinished = true;
            node.nodeValue = originalText;
        }
    }, 1500);

    const interval = setInterval(() => {
        if (isFinished) {
            clearInterval(interval);
            clearTimeout(safetyTimeout);
            return;
        }

        node.nodeValue = originalText
            .split("")
            .map((char, index) => {
                if (char === " " || char === "\n" || char === "\t") return char;
                if (index < iteration) {
                    return originalText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iteration >= textLen) {
            isFinished = true;
            clearInterval(interval);
            clearTimeout(safetyTimeout);
            node.nodeValue = originalText; // 100% Guaranteed pristine text
        }

        iteration += 0.5; // Smooth, crisp decoding speed
    }, 30);

    // Return cleanup function
    return () => {
        if (!isFinished) {
            isFinished = true;
            clearInterval(interval);
            clearTimeout(safetyTimeout);
            node.nodeValue = originalText; // Immediately restore true text on cleanup
        }
    };
};

const scrambleText = (element) => {
    if (!element) return;

    // If an animation is already running on this element, cancel it immediately and restore true text
    if (_activeScrambleMap.has(element)) {
        const cleanup = _activeScrambleMap.get(element);
        if (typeof cleanup === "function") cleanup();
        _activeScrambleMap.delete(element);
    }

    const textNodes = [];
    const getTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Pre-cache pristine value on discovery if not already cached
            if (!_pristineTextMap.has(node)) {
                _pristineTextMap.set(node, node.nodeValue || "");
            }
            textNodes.push(node);
        } else {
            for (let child of node.childNodes) {
                getTextNodes(child);
            }
        }
    };
    getTextNodes(element);

    if (textNodes.length === 0) return;

    const cleanups = [];
    textNodes.forEach((node) => {
        const cleanup = scrambleTextNode(node);
        cleanups.push(cleanup);
    });

    // Store combined cleanup function on the element
    _activeScrambleMap.set(element, () => {
        cleanups.forEach((fn) => fn && fn());
    });
};

/*=============== GSAP SCROLLTRIGGER REVEAL ANIMATIONS ===============*/
function initScrollReveals() {
    // Run continuous animations & interactions
    initParticleCanvas();
    runProfileFloat();
    initMagnetic();
    init3DTilt();


    // Section Titles Reveal with scramble
    gsap.utils.toArray(".section__title").forEach((title) => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 85%",
                toggleActions: "play none none none",
                onEnter: () => scrambleText(title)
            },
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "power3.out"
        });
    });

    // About Section Reveal
    if (document.querySelector(".about__container")) {
        gsap.from(".about__data", {
            scrollTrigger: {
                trigger: ".about__container",
                start: "top 80%"
            },
            opacity: 0,
            x: -80,
            duration: 1.2,
            ease: "power3.out"
        });
        gsap.from(".about__image", {
            scrollTrigger: {
                trigger: ".about__container",
                start: "top 80%"
            },
            opacity: 0,
            x: 80,
            duration: 1.2,
            ease: "power3.out"
        });
    }

    // Skills Cards Stagger Reveal
    if (document.querySelector(".skills__container")) {
        gsap.from(".skills__card", {
            scrollTrigger: {
                trigger: ".skills__container",
                start: "top 80%"
            },
            opacity: 0,
            y: 50,
            stagger: 0.15,
            duration: 1,
            ease: "power2.out"
        });
    }

    // Services Cards Stagger Reveal
    if (document.querySelector(".services__container")) {
        gsap.from(".services__card", {
            scrollTrigger: {
                trigger: ".services__container",
                start: "top 80%"
            },
            opacity: 0,
            y: 50,
            stagger: 0.15,
            duration: 1,
            ease: "power2.out"
        });
    }

    // Reveal Projects swiper
    if (document.querySelector(".projects__container")) {
        gsap.from(".projects__container", {
            scrollTrigger: {
                trigger: ".projects__container",
                start: "top 80%"
            },
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: "power3.out"
        });
    }

    // Experience (Work) Section Reveal - Growing line & staggered cards
    if (document.querySelector(".work__container")) {
        const workTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".work__container",
                start: "top 80%"
            }
        });

        workTl.from(".work__line", {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 1.2,
            ease: "power3.inOut"
        })
            .from(".work__card", {
                opacity: 0,
                y: 50,
                stagger: 0.2,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.8");
    }

    // Contact Section Reveal
    if (document.querySelector(".contact__container")) {
        gsap.from(".contact__data", {
            scrollTrigger: {
                trigger: ".contact__container",
                start: "top 85%"
            },
            opacity: 0,
            x: -50,
            duration: 1,
            ease: "power3.out"
        });
        gsap.from(".contact__content", {
            scrollTrigger: {
                trigger: ".contact__container",
                start: "top 85%"
            },
            opacity: 0,
            x: 50,
            duration: 1,
            ease: "power3.out"
        });
    }

    // Blob Animate parallax movement
    gsap.utils.toArray(".blob-animate").forEach((blob) => {
        gsap.to(blob, {
            scrollTrigger: {
                trigger: blob,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            },
            y: -50,
            ease: "none"
        });
    });
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
    const header = document.getElementById("header");
    if (!header) return;
    if (window.scrollY >= 50) {
        header.classList.add("scroll-header");
    } else {
        header.classList.remove("scroll-header");
    }
};
window.addEventListener("scroll", scrollHeader);

/*=============== SHOW SCROLL UP & SMOOTH TOP SCROLL ===============*/
const scrollUp = () => {
    const scrollUpButton = document.getElementById("scroll-up");
    if (!scrollUpButton) return;
    if (window.scrollY >= 350) {
        scrollUpButton.classList.add("show-scroll");
    } else {
        scrollUpButton.classList.remove("show-scroll");
    }
};
window.addEventListener("scroll", scrollUp);

document.addEventListener("DOMContentLoaded", () => {
    /*=============== SHOW MENU ===============*/
    const navMenu = document.getElementById('nav-menu'),
        navToggle = document.getElementById('nav-toggle'),
        navClose = document.getElementById('nav-close')

    /* Menu show */
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show-menu')
        })
    }

    /* Menu hidden */
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show-menu')
        })
    }

    /*=============== REMOVE MENU ON LINK CLICK ===============*/
    const navLinks = document.querySelectorAll('.nav__link')
    navLinks.forEach(n => n.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('show-menu')
        }
    }))

    const scrollUpBtn = document.getElementById("scroll-up");
    if (scrollUpBtn) {
        scrollUpBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (lenis) {
                lenis.scrollTo("#home");
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
});
