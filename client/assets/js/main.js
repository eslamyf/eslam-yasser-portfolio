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

function switchProjectImage(galleryId, imgUrl) {
    const container = document.getElementById(galleryId);
    if (!container) return;
    const imgEl = container.querySelector('.projects__img');
    if (imgEl) imgEl.src = imgUrl;
    container.querySelectorAll('.proj-gallery-dot').forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('onclick') && dot.getAttribute('onclick').includes(imgUrl.replace(/'/g, "\\'"))) {
            dot.classList.add('active');
        }
    });
}

function renderProjects(projects) {
    projectsContent.innerHTML = projects
        .map((project, idx) => {
            const displayId = project.id || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`);
            const hasDemo = project.demo && project.demo.trim() !== '' && project.demo !== '#';
            const hasGithub = project.github && project.github.trim() !== '' && project.github !== '#';

            // ---- VIDEO DETECTION (YouTube / Loom / Vimeo) ----
            let videoEmbed = null;
            // Check videoUrl first (generic), then youtubeUrl, then youtubeId
            const rawVideoUrl = project.videoUrl || project.youtubeUrl || '';
            if (rawVideoUrl) {
                videoEmbed = extractVideoEmbed(rawVideoUrl);
            }
            // Legacy: direct youtubeId field
            if (!videoEmbed && project.youtubeId) {
                videoEmbed = {
                    type: 'youtube',
                    id: project.youtubeId,
                    embedUrl: `https://www.youtube-nocookie.com/embed/${project.youtubeId}?autoplay=1&rel=0`
                };
            }

            // ---- IMAGES GALLERY ----
            // Combine main image with extra images array, deduplicate
            const mainImage = project.image || 'assets/img/backend_api.jpg';
            const extraImages = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
            const allImages = [mainImage, ...extraImages.filter(img => img !== mainImage)];

            // Gallery HTML: if multiple images, show mini dot selector
            const galleryId = `gallery-${displayId}-${idx}`;
            let galleryHtml = '';
            if (allImages.length > 1) {
                const dotsHtml = allImages.map((img, i) =>
                    `<button class="proj-gallery-dot${i === 0 ? ' active' : ''}" 
                        onclick="switchProjectImage('${galleryId}', '${img.replace(/'/g, "\\'")}')"
                        aria-label="Image ${i + 1}"></button>`
                ).join('');
                galleryHtml = `<div class="proj-gallery-dots">${dotsHtml}</div>`;
            }

            // Video overlay button on image
            const videoOverlayBtn = videoEmbed
                ? `<button onclick="openVideoEmbedModal('${videoEmbed.embedUrl}', '${(project.title || '').replace(/'/g, "\\'")}', '${videoEmbed.type}')" class="projects__play-btn" title="Watch Demo">
                       <i class="ri-play-fill"></i>
                   </button>`
                : '';

            // ---- ACTION BUTTONS ----
            const liveBtn = hasDemo
                ? `<a href="${project.demo}" target="_blank" class="projects__btn projects__btn--live"><i class="ri-global-line"></i> Live Demo</a>`
                : `<span class="projects__btn projects__btn--disabled"><i class="ri-global-line"></i> Live Demo</span>`;

            const githubBtn = hasGithub
                ? `<a href="${project.github}" target="_blank" class="projects__btn projects__btn--github"><i class="ri-github-line"></i> GitHub</a>`
                : `<span class="projects__btn projects__btn--disabled"><i class="ri-github-line"></i> GitHub</span>`;

            const youtubeBtn = videoEmbed
                ? `<button onclick="openVideoEmbedModal('${videoEmbed.embedUrl}', '${(project.title || '').replace(/'/g, "\\'")}', '${videoEmbed.type}')" class="projects__btn" style="background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3);">
                       <i class="ri-play-circle-line"></i> Watch Demo
                   </button>`
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
            </div>
            
            <div class="projects__image" id="${galleryId}">
                <img src="${mainImage}" alt="${project.title}" 
                     class="projects__img" 
                     width="302" height="180" loading="lazy"
                     style="cursor: zoom-in;"
                     onclick="openLightboxModal(this.src, '${(project.title || '').replace(/'/g, "\\'")}')"
                     onerror="this.src='assets/img/backend_api.jpg'">
                ${videoOverlayBtn}
                ${galleryHtml}
            </div>

            <div class="projects__buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${liveBtn}
                ${githubBtn}
                ${youtubeBtn}
            </div>
        </article>
        `;
        })
        .join('');
}

/*=============== SIMPLE & ROBUST PDF MODAL & DOWNLOAD HANDLERS ===============*/

// Constant direct static path - Canonical Master Resume
const STATIC_CV_PATH = 'assets/pdf/Eslam_Yasser_Resume.pdf';

/**
 * Robust URL resolver for PDF and document assets.
 * Works seamlessly across Live Server (5500/5501), Express server (5000), file protocol, and static production.
 */
function resolvePdfUrl(rawPath, fileName) {
    const targetName = fileName || 'Eslam_Yasser_Resume.pdf';
    let pathStr = (rawPath || STATIC_CV_PATH).trim();

    // 1. External / Full URL (Cloudinary, S3, external)
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) {
        return {
            directUrl: pathStr,
            apiUrl: pathStr,
            downloadUrl: pathStr,
            fileName: targetName
        };
    }

    // Clean relative path
    const clean = pathStr.replace(/^[/\\]+/, '');

    // 2. Static client asset (assets/pdf/...)
    if (clean.startsWith('assets/')) {
        const directUrl = `${window.location.origin}/${clean}`;
        const localRelative = clean;
        const apiUrl = `${API_BASE}/files/view?filePath=${encodeURIComponent(clean)}`;
        const downloadUrl = `${API_BASE}/files/download?filePath=${encodeURIComponent(clean)}&name=${encodeURIComponent(targetName)}`;
        return { directUrl: localRelative, fullDirectUrl: directUrl, apiUrl, downloadUrl, fileName: targetName };
    }

    // 3. Uploaded server asset (uploads/...)
    if (clean.startsWith('uploads/')) {
        const directUrl = `${SERVER_BASE}/${clean}`;
        const apiUrl = `${API_BASE}/files/view?filePath=${encodeURIComponent(clean)}`;
        const downloadUrl = `${API_BASE}/files/download?filePath=${encodeURIComponent(clean)}&name=${encodeURIComponent(targetName)}`;
        return { directUrl, fullDirectUrl: directUrl, apiUrl, downloadUrl, fileName: targetName };
    }

    // 4. Default / Bare filename
    const directUrl = STATIC_CV_PATH;
    const apiUrl = `${API_BASE}/files/view?filePath=${encodeURIComponent(clean)}`;
    const downloadUrl = `${API_BASE}/files/download?filePath=${encodeURIComponent(clean)}&name=${encodeURIComponent(targetName)}`;
    return { directUrl, fullDirectUrl: `${window.location.origin}/${STATIC_CV_PATH}`, apiUrl, downloadUrl, fileName: targetName };
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
 * Unified Bulletproof File Downloader
 * Tries Blob extraction first, then falls back to direct browser download.
 * Works 100% offline, on Live Server, and with backend.
 */
async function downloadFile(filePath, fileName) {
    const targetPath = filePath || STATIC_CV_PATH;
    const targetName = fileName || 'Eslam_Yasser_Resume.pdf';
    const resolved = resolvePdfUrl(targetPath, targetName);

    showToast(`جاري تحميل ${targetName}...`, 'ri-download-2-line');

    // Ordered list of candidate download sources
    const candidateUrls = [
        resolved.directUrl,
        resolved.fullDirectUrl,
        resolved.downloadUrl,
        resolved.apiUrl,
        STATIC_CV_PATH
    ].filter(Boolean);

    // Strategy 1: Fetch as binary Blob and trigger instantaneous programmatic download
    for (const url of candidateUrls) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                const blob = await res.blob();
                if (blob && blob.size > 100) {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = blobUrl;
                    a.download = targetName;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        if (a.parentNode) document.body.removeChild(a);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 1000);
                    showToast(`تم تحميل ${targetName} بنجاح!`, 'ri-checkbox-circle-line');
                    return;
                }
            }
        } catch (err) {
            // Silently try next fallback URL
        }
    }

    // Strategy 2: Direct Anchor trigger fallback
    try {
        const fallbackA = document.createElement('a');
        fallbackA.style.display = 'none';
        fallbackA.href = resolved.directUrl || STATIC_CV_PATH;
        fallbackA.download = targetName;
        fallbackA.target = '_blank';
        document.body.appendChild(fallbackA);
        fallbackA.click();
        setTimeout(() => {
            if (fallbackA.parentNode) document.body.removeChild(fallbackA);
        }, 1000);
        showToast(`بدأ تحميل ${targetName}`, 'ri-checkbox-circle-line');
    } catch (err) {
        console.error('[Download Fallback Error]:', err);
        window.open(resolved.directUrl || STATIC_CV_PATH, '_blank');
    }
}

// Backward-compatible alias
function downloadFileBlob(url, filename) {
    downloadFile(url, filename);
}

/* ==================== HIGH-FIDELITY PDF.JS VIEWER ENGINE ==================== */
let _pdfDocState = null;
let _pdfScaleState = 1.15;
let _pdfTargetPath = null;
let _pdfTargetName = null;
let _pdfViewMode = 'canvas'; // 'canvas' | 'native'

/**
 * Unified PDF Viewer Modal with Dual Engine (PDF.js Canvas & Native Embed)
 */
function openPdfModal(pdfUrl, title, originalFileName) {
    const modal = document.getElementById('pdf-viewer-modal');
    const container = document.getElementById('pdf-modal-container');
    const titleEl = document.getElementById('pdf-modal-title');
    const downloadBtn = document.getElementById('pdf-modal-download-btn');

    if (!modal || !container) return;

    _pdfTargetPath = pdfUrl || STATIC_CV_PATH;
    _pdfTargetName = originalFileName || (title ? `${title}.pdf` : 'Eslam_Yasser_Resume.pdf');
    _pdfScaleState = window.innerWidth < 768 ? 0.8 : 1.15;
    _pdfViewMode = 'canvas';

    const resolved = resolvePdfUrl(_pdfTargetPath, _pdfTargetName);

    if (titleEl) {
        titleEl.innerHTML = `<i class="ri-file-pdf-2-line" style="color: var(--first-color);"></i> ${title || 'Document Viewer'}`;
    }

    if (downloadBtn) {
        downloadBtn.onclick = (e) => {
            e.preventDefault();
            downloadFile(_pdfTargetPath, _pdfTargetName);
        };
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    renderPdfViewerUI(resolved);
}

/**
 * Renders the PDF Viewer Toolbar and Viewport Container
 */
function renderPdfViewerUI(resolved) {
    const container = document.getElementById('pdf-modal-container');
    if (!container) return;

    const directUrl = resolved.directUrl || STATIC_CV_PATH;

    container.innerHTML = `
        <div class="pdf-modal-toolbar">
            <div class="pdf-toolbar-group">
                <button type="button" class="pdf-tool-btn" onclick="zoomPdfView(-0.15)" title="تصغير">
                    <i class="ri-zoom-out-line"></i>
                </button>
                <button type="button" class="pdf-tool-btn" onclick="resetPdfZoomView()" title="إعادة ضبط الحجم">
                    <span id="pdf-zoom-level">${Math.round(_pdfScaleState * 100)}%</span>
                </button>
                <button type="button" class="pdf-tool-btn" onclick="zoomPdfView(0.15)" title="تكبير">
                    <i class="ri-zoom-in-line"></i>
                </button>
                <span id="pdf-page-indicator" class="pdf-page-indicator">جاري التحميل...</span>
            </div>

            <div class="pdf-toolbar-group">
                <button type="button" class="pdf-tool-btn" id="pdf-toggle-mode-btn" onclick="togglePdfViewMode()" title="تبديل وضع العرض">
                    <i class="ri-pages-line"></i> العرض المباشر
                </button>
                <a href="${directUrl}" target="_blank" class="pdf-tool-btn" title="فتح في نافذة جديدة">
                    <i class="ri-external-link-line"></i> نافذة جديدة
                </a>
            </div>
        </div>

        <div id="pdf-viewport-area" class="pdf-viewport">
            <div class="pdf-loading-state" id="pdf-loading-box">
                <div class="pdf-loading-spinner"></div>
                <p>جاري معالجة مستند الـ PDF وعرض الصفحات بدقة عالية...</p>
            </div>
        </div>
    `;

    loadAndRenderPdfDocument(resolved);
}

/**
 * Loads the PDF document using PDF.js and renders all pages
 */
async function loadAndRenderPdfDocument(resolved) {
    const viewport = document.getElementById('pdf-viewport-area');
    const pageIndicator = document.getElementById('pdf-page-indicator');
    if (!viewport) return;

    const candidateUrls = [
        resolved.directUrl,
        resolved.apiUrl,
        resolved.fullDirectUrl,
        STATIC_CV_PATH
    ].filter(Boolean);

    // Verify PDF.js library presence
    if (typeof pdfjsLib === 'undefined') {
        renderNativePdfFallback(resolved);
        return;
    }

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    } catch (e) {
        // Continue if worker fails
    }

    let pdfBuffer = null;

    // Fetch array buffer from candidate URLs
    for (const url of candidateUrls) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
            if (res.ok) {
                const buf = await res.arrayBuffer();
                if (buf && buf.byteLength > 100) {
                    pdfBuffer = buf;
                    break;
                }
            }
        } catch (e) {
            // try next url
        }
    }

    try {
        const loadingTask = pdfBuffer
            ? pdfjsLib.getDocument({
                data: pdfBuffer,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
            })
            : pdfjsLib.getDocument(resolved.directUrl || STATIC_CV_PATH);

        _pdfDocState = await loadingTask.promise;
        const totalPages = _pdfDocState.numPages;

        if (pageIndicator) {
            pageIndicator.textContent = `عدد الصفحات: ${totalPages}`;
        }

        renderAllPdfPages(_pdfDocState, _pdfScaleState);
    } catch (err) {
        console.warn('[PDF.js Render Fallback]:', err);
        renderNativePdfFallback(resolved);
    }
}

/**
 * Renders all pages of the active PDF document to canvas
 */
async function renderAllPdfPages(pdfDoc, scale) {
    const viewport = document.getElementById('pdf-viewport-area');
    if (!viewport || !pdfDoc) return;

    viewport.innerHTML = '';

    const dpr = window.devicePixelRatio || 1;

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        try {
            const page = await pdfDoc.getPage(pageNum);
            const initialViewport = page.getViewport({ scale: 1 });

            // Calculate auto-scale for mobile screens
            let effectiveScale = scale;
            if (window.innerWidth < 768) {
                const availableWidth = Math.min(window.innerWidth - 48, 800);
                effectiveScale = (availableWidth / initialViewport.width) * scale;
            }

            const pageViewport = page.getViewport({ scale: effectiveScale });

            const pageBox = document.createElement('div');
            pageBox.className = 'pdf-page-container';

            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-canvas';
            const ctx = canvas.getContext('2d', { alpha: false });

            // High-DPI Sharp Rendering
            canvas.width = Math.floor(pageViewport.width * dpr);
            canvas.height = Math.floor(pageViewport.height * dpr);
            canvas.style.width = `${Math.floor(pageViewport.width)}px`;
            canvas.style.height = `${Math.floor(pageViewport.height)}px`;

            ctx.scale(dpr, dpr);

            pageBox.appendChild(canvas);
            viewport.appendChild(pageBox);

            const renderContext = {
                canvasContext: ctx,
                viewport: pageViewport
            };

            await page.render(renderContext).promise;
        } catch (renderError) {
            console.error(`Error rendering PDF page ${pageNum}:`, renderError);
        }
    }
}

/**
 * Fallback Embed viewer (Native Iframe / Object)
 */
function renderNativePdfFallback(resolved) {
    const viewport = document.getElementById('pdf-viewport-area');
    const toggleBtn = document.getElementById('pdf-toggle-mode-btn');
    const pageIndicator = document.getElementById('pdf-page-indicator');
    if (!viewport) return;

    const url = resolved.directUrl || STATIC_CV_PATH;

    if (pageIndicator) pageIndicator.textContent = 'العرض الأصلي';
    if (toggleBtn) toggleBtn.innerHTML = '<i class="ri-image-line"></i> عرض Canvas HD';

    viewport.innerHTML = `
        <div style="width:100%; height:100%; min-height:75vh; border-radius:8px; overflow:hidden;">
            <iframe src="${url}#toolbar=1" style="width:100%; height:100%; min-height:75vh; border:none;" title="PDF Preview">
                <div class="pdf-error-state">
                    <i class="ri-file-warning-line"></i>
                    <h3>تعذر العرض المباشر في المتصفح</h3>
                    <p>يمكنك تحميل المستند مباشرة بجودة أصلية والاطلاع عليه على جهازك.</p>
                    <button class="pdf-tool-btn pdf-tool-btn--primary" onclick="downloadFile('${_pdfTargetPath}', '${_pdfTargetName}')">
                        <i class="ri-download-line"></i> تحميل ملف الـ PDF الآن
                    </button>
                </div>
            </iframe>
        </div>
    `;
}

/**
 * Zoom In / Zoom Out Controller
 */
function zoomPdfView(delta) {
    _pdfScaleState = Math.max(0.5, Math.min(2.5, _pdfScaleState + delta));
    const zoomLevelEl = document.getElementById('pdf-zoom-level');
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(_pdfScaleState * 100)}%`;

    if (_pdfDocState && _pdfViewMode === 'canvas') {
        renderAllPdfPages(_pdfDocState, _pdfScaleState);
    }
}

/**
 * Reset Zoom to Default Fit
 */
function resetPdfZoomView() {
    _pdfScaleState = window.innerWidth < 768 ? 0.8 : 1.15;
    const zoomLevelEl = document.getElementById('pdf-zoom-level');
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(_pdfScaleState * 100)}%`;

    if (_pdfDocState && _pdfViewMode === 'canvas') {
        renderAllPdfPages(_pdfDocState, _pdfScaleState);
    }
}

/**
 * Toggle between PDF.js Canvas and Native Browser View
 */
function togglePdfViewMode() {
    const resolved = resolvePdfUrl(_pdfTargetPath, _pdfTargetName);
    const toggleBtn = document.getElementById('pdf-toggle-mode-btn');

    if (_pdfViewMode === 'canvas') {
        _pdfViewMode = 'native';
        renderNativePdfFallback(resolved);
    } else {
        _pdfViewMode = 'canvas';
        if (toggleBtn) toggleBtn.innerHTML = '<i class="ri-pages-line"></i> العرض المباشر';
        loadAndRenderPdfDocument(resolved);
    }
}

function closePdfModal() {
    const modal = document.getElementById("pdf-viewer-modal");
    const container = document.getElementById("pdf-modal-container");
    if (modal) {
        if (container) container.innerHTML = "";
        modal.style.display = "none";
        document.body.style.overflow = "";
    }
    _pdfDocState = null;
}

function handleCvView(e) {
    if (e) e.preventDefault();
    fetch(`${API_BASE}/cv/active`, { signal: AbortSignal.timeout(1200) })
        .then(r => r.json())
        .then(res => {
            if (res.success && res.data && res.data.pdfFile) {
                openPdfModal(res.data.pdfFile, res.data.name, res.data.originalName);
            } else {
                openPdfModal(STATIC_CV_PATH, 'Eslam Yasser - Resume', 'Eslam_Yasser_Resume.pdf');
            }
        })
        .catch(() => {
            openPdfModal(STATIC_CV_PATH, 'Eslam Yasser - Resume', 'Eslam_Yasser_Resume.pdf');
        });
}

function handleCvDownload(e) {
    if (e) e.preventDefault();
    fetch(`${API_BASE}/cv/active`, { signal: AbortSignal.timeout(1200) })
        .then(r => r.json())
        .then(res => {
            const path = (res.success && res.data && res.data.pdfFile) ? res.data.pdfFile : STATIC_CV_PATH;
            const name = (res.success && res.data && res.data.originalName) ? res.data.originalName : 'Eslam_Yasser_Resume.pdf';
            downloadFile(path, name);
        })
        .catch(() => {
            downloadFile(STATIC_CV_PATH, 'Eslam_Yasser_Resume.pdf');
        });
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

function closeVideoModal() {
    const modal = document.getElementById("video-player-modal");
    const videoEl = document.getElementById("video-modal-element");
    if (modal && videoEl) {
        videoEl.pause();
        videoEl.src = "";
        modal.style.display = "none";
    }
}

function openLightboxModal(imageUrl, title) {
    const modal = document.getElementById("image-lightbox-modal");
    const imgEl = document.getElementById("lightbox-modal-img");
    const titleEl = document.getElementById("lightbox-modal-title");

    if (modal && imgEl) {
        titleEl.innerHTML = `<i class="ri-image-line" style="color: var(--first-color);"></i> ${title || 'Image View'}`;
        imgEl.src = imageUrl;
        modal.style.display = "flex";
    }
}

function closeLightboxModal() {
    const modal = document.getElementById("image-lightbox-modal");
    if (modal) modal.style.display = "none";
}

/**
 * Extract video embed data from any video URL (YouTube, Loom, Vimeo)
 * @returns {object|null} { type, embedUrl, id? }
 */
function extractVideoEmbed(url) {
    if (!url || !url.trim()) return null;
    url = url.trim();

    // YouTube: youtu.be/ID, watch?v=ID, /embed/ID
    const ytMatch = url.match(/(?:youtu\.be\/|v=|v\/|embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return {
            type: 'youtube',
            id: ytMatch[1],
            embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`
        };
    }

    // Loom: loom.com/share/ID
    const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
        return {
            type: 'loom',
            id: loomMatch[1],
            embedUrl: `https://www.loom.com/embed/${loomMatch[1]}?autoplay=1`
        };
    }

    // Vimeo: vimeo.com/ID
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch) {
        return {
            type: 'vimeo',
            id: vimeoMatch[1],
            embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0`
        };
    }

    return null;
}

/**
 * Open a universal video modal — supports YouTube, Loom, Vimeo, or any embed URL
 */
function openVideoEmbedModal(embedUrl, title, videoType) {
    const modal = document.getElementById('youtube-video-modal');
    const iframe = document.getElementById('yt-modal-iframe');
    const titleEl = document.getElementById('yt-modal-title');
    if (!modal || !iframe) return;

    let iconHtml = '<i class="ri-video-fill" style="color: var(--first-color);"></i>';
    if (videoType === 'youtube') iconHtml = '<i class="ri-youtube-fill" style="color: #ef4444;"></i>';
    else if (videoType === 'loom') iconHtml = '<i class="ri-record-circle-line" style="color: #8b5cf6;"></i>';
    else if (videoType === 'vimeo') iconHtml = '<i class="ri-vimeo-line" style="color: #1ab7ea;"></i>';

    titleEl.innerHTML = `${iconHtml} ${title || 'Demo Video'}`;
    iframe.src = embedUrl;
    modal.style.display = 'flex';
}

/*=============== PROTECTED YOUTUBE MODAL LOGIC ===============*/
function openYouTubeModal(videoId, title) {
    const modal = document.getElementById("youtube-video-modal");
    const iframe = document.getElementById("yt-modal-iframe");
    const titleEl = document.getElementById("yt-modal-title");

    if (modal && iframe) {
        titleEl.innerHTML = `<i class="ri-youtube-fill" style="color: #ef4444;"></i> ${title || 'Demo Video'}`;
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
        modal.style.display = "flex";
    }
}

function closeYouTubeModal() {
    const modal = document.getElementById("youtube-video-modal");
    const iframe = document.getElementById("yt-modal-iframe");

    if (modal && iframe) {
        iframe.src = "";
        modal.style.display = "none";
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
    certificatesContainer = document.getElementById("certificates");

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
            renderWorkItems(data.certificates, certificatesContainer);
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

function renderCertificateItems(items, container) {
    if (!container || !items) return;
    container.innerHTML = items
        .map((item) => {
            const isPdf = item.pdfFile && item.pdfFile.trim() !== '';
            const isImage = item.image && item.image.trim() !== '';
            const originalName = item.originalPdfName || `${item.name}.pdf`;

            let viewBtn = '';
            let downloadBtn = '';

            if (isPdf) {
                viewBtn = `<button onclick="openPdfModal('${item.pdfFile.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}', '${originalName.replace(/'/g, "\\'")}')" class="work__link-btn"><i class="ri-file-pdf-2-line"></i> View Certificate</button>`;
                downloadBtn = `<button onclick="downloadFile('${item.pdfFile.replace(/'/g, "\\'")}', '${originalName.replace(/'/g, "\\'")}')" class="work__link-btn work__link-btn--live"><i class="ri-download-line"></i> Download</button>`;
            } else if (isImage) {
                viewBtn = `<button onclick="openLightboxModal('${item.image.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')" class="work__link-btn"><i class="ri-image-line"></i> View Image</button>`;
                downloadBtn = `<button onclick="downloadFile('${item.image.replace(/'/g, "\\'")}', '${originalName.replace(/'/g, "\\'")}')" class="work__link-btn work__link-btn--live"><i class="ri-download-line"></i> Download</button>`;
            }

            return `
        <div class="work__card">
            <div class="work__data">
                <div>
                    <h1 class="work__title">${item.name}</h1>
                    <h3 class="work__subtitle">${item.issuer} ${item.credentialId ? `(ID: ${item.credentialId})` : ''}</h3>
                </div>
                <h2 class="work__year">${item.issueDate || ''}</h2>
            </div>
            <p class="work__description">${item.description || ''}</p>
            <div class="work__link-wrapper" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1rem;">
                ${viewBtn}
                ${downloadBtn}
            </div>
        </div>`;
        }).join("");
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
                subject: `New Inquiry from ${name}`
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
const initParticleCanvas = () => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

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

    const init = () => {
        particles = [];
        const numParticles = Math.min(Math.floor((canvas.width * canvas.height) / 16000), 80);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);
};

/*=============== DIGITAL SCRAMBLE TEXT EFFECT ===============*/
const scrambleTextNode = (node) => {
    const originalText = node.nodeValue;
    if (!originalText || !originalText.trim()) return;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$%#@*&?-+=^![]{}/~0123456789";
    let iterations = 0;

    const interval = setInterval(() => {
        node.nodeValue = originalText
            .split("")
            .map((char, index) => {
                if (char === " " || char === "\n") return char;
                if (index < iterations) {
                    return originalText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iterations >= originalText.length) {
            clearInterval(interval);
            node.nodeValue = originalText;
        }
        iterations += 0.3; // Slower speed (was 1/2)
    }, 35); // Slower tick interval (was 25ms)
};

const scrambleText = (element) => {
    const textNodes = [];
    const getTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node);
        } else {
            for (let child of node.childNodes) {
                getTextNodes(child);
            }
        }
    };
    getTextNodes(element);
    textNodes.forEach(scrambleTextNode);
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
