//Using In header 

document.addEventListener("DOMContentLoaded", () => {
    
    const header = document.getElementById("glassHeader");
    
    let lastScroll = window.scrollY;
    let ticking = false;
    
    function updateGlassHeader() {
        
        const currentScroll = window.scrollY;
        
        // Scroll Top - White Glass
        if (currentScroll <= 5) {
            
            header.classList.remove("black-glass");
            header.classList.add("white-glass");
            
        }
        
        // Scroll Down - Black Glass
        else if (currentScroll > lastScroll + 2) {
            
            header.classList.add("black-glass");
            header.classList.remove("white-glass");
            
        }
        
        // Scroll Up - White Glass
        else if (currentScroll < lastScroll - 2) {
            
            header.classList.remove("black-glass");
            header.classList.add("white-glass");
            
        }
        
        lastScroll = currentScroll;
        ticking = false;
    }
    
    window.addEventListener("scroll", () => {
        
        if (!ticking) {
            window.requestAnimationFrame(updateGlassHeader);
            ticking = true;
        }
        
    }, { passive: true });
    
    header.classList.add("white-glass");
    
});


//Using In Header 

//Navigation Bar Js code

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide SVG icons
  if (window.lucide) {
    lucide.createIcons();
  }

  const navbar = document.getElementById("navbar");
  const waterDrop = document.getElementById("waterDrop");
  const navItems = document.querySelectorAll(".nav-item");

  let currentIndex = 2; // Default to 'Apps' matching the reference picture
  let isMoving = false;

  // Reposition the glass droplet lens over the chosen element
  function updateWaterDropPosition(targetElement, animateSquish = false) {
    const navRect = navbar.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // Calculate center offset relative to the navbar container
    const xPos = targetRect.left - navRect.left + (targetRect.width / 2) - (waterDrop.offsetWidth / 2);

    if (animateSquish) {
      // Add liquid elongation in motion direction
      const diff = targetRect.left - (navItems[currentIndex] ? navItems[currentIndex].getBoundingClientRect().left : 0);
      const direction = diff >= 0 ? 1 : -1;
      
      waterDrop.style.transform = `translate3d(${xPos}px, 0, 0) skewX(${direction * -4}deg) scaleX(1.15) scaleY(0.92)`;
      
      clearTimeout(waterDrop.squishTimeout);
      waterDrop.squishTimeout = setTimeout(() => {
        // Return to standard spherical lens on rest
        waterDrop.style.transform = `translate3d(${xPos}px, 0, 0) scale(1)`;
      }, 300);
    } else {
      waterDrop.style.transform = `translate3d(${xPos}px, 0, 0)`;
    }
  }

  // Click & Touch Handlers
  navItems.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentIndex === index) return;

      navItems[currentIndex].classList.remove("active");
      item.classList.add("active");

      updateWaterDropPosition(item, true);
      currentIndex = index;
    });
  });

  // Initial placement over the active item ("Apps")
  const initialActive = document.querySelector(".nav-item.active") || navItems[2];
  updateWaterDropPosition(initialActive, false);

  // Recalculate on window resize for responsive layout
  window.addEventListener("resize", () => {
    const activeItem = navItems[currentIndex];
    if (activeItem) {
      updateWaterDropPosition(activeItem, false);
    }
  });
});

//Navigation Bar Js Code



//press and hold 



document.addEventListener("DOMContentLoaded", () => {

    const navbar = document.getElementById("navbar");
    const waterDrop = document.getElementById("waterDrop");

    const navItems = [...navbar.querySelectorAll(".nav-item")];

    let currentIndex = Math.max(
        0,
        navItems.findIndex(item => item.classList.contains("active"))
    );

    let dragging = false;
    let moved = false;
    let startX = 0;
    let ignoreClick = false;
    let activatingDrop = false;
    let ignoreClickTimer;

    // POSITION LENS

    function updateLens(index, smooth = true) {

        currentIndex = Math.max(
            0,
            Math.min(index, navItems.length - 1)
        );

        const item = navItems[currentIndex];

        const navRect = navbar.getBoundingClientRect();
        const rect = item.getBoundingClientRect();

        const width = rect.width - 8;

        const x = rect.left - navRect.left +
                  (rect.width - width) / 2;

        waterDrop.style.transition = smooth ? "1px" : "none";

        waterDrop.style.width = width + "''";

        waterDrop.style.transform =
            `translate3d(${x}px,0,0)`;

        navItems.forEach((el, i) => {
            el.classList.toggle("active", i === currentIndex);
        });
    }

    // FIND NEAREST BUTTON

    function nearestButton(clientX) {

        let nearest = 0;
        let distance = Infinity;

        navItems.forEach((item, i) => {

            const rect = item.getBoundingClientRect();
            const center = rect.left + rect.width / 2;

            const d = Math.abs(clientX - center);

            if (d < distance) {
                distance = d;
                nearest = i;
            }
        });

        return nearest;
    }

    // PRESS AND HOLD

    navbar.addEventListener("pointerdown", e => {

        if (!e.target.closest(".nav-link")) return;

        if (e.pointerType === "mouse" && e.button !== 0) return;

        const item = e.target.closest(".nav-item");
        const index = navItems.indexOf(item);

        if (index < 0) return;

        dragging = true;
        moved = false;
        startX = e.clientX;

        navbar.setPointerCapture(e.pointerId);

        navbar.classList.add("is-pressed");

        updateLens(index);
    });

    // DRAG CONTINUOUSLY

    navbar.addEventListener("pointermove", e => {

        if (!dragging) return;

        if (Math.abs(e.clientX - startX) > 6) {
            moved = true;
            navbar.classList.add("is-dragging");
        }

        const index = nearestButton(e.clientX);

        if (index !== currentIndex) {
            currentIndex = index;

            navItems.forEach((item, i) => {
                item.classList.toggle("active", i === index);
            });
        }

        const navRect = navbar.getBoundingClientRect();
        const width = waterDrop.offsetWidth;

        const x = e.clientX - navRect.left - width / 2;

        waterDrop.style.transform =
            `translate3d(${x}px,0,0)`;
    });

    // RELEASE

    function release(event, activate) {

        if (!dragging) return;

        dragging = false;

        navbar.classList.remove("is-pressed");
        navbar.classList.remove("is-dragging");

        let releasedIndex = -1;
        if (activate) {
            releasedIndex = navItems.findIndex(item => {
                const rect = item.getBoundingClientRect();
                return event.clientX >= rect.left &&
                       event.clientX <= rect.right &&
                       event.clientY >= rect.top &&
                       event.clientY <= rect.bottom;
            });

            if (releasedIndex >= 0) {
                currentIndex = releasedIndex;
            }
        }

        updateLens(currentIndex);

        if (activate) {
            ignoreClick = true;
            window.clearTimeout(ignoreClickTimer);

            if (releasedIndex >= 0) {
                const link = navItems[releasedIndex].querySelector(".nav-link");
                activatingDrop = true;
                link.click();
                activatingDrop = false;
            }

            ignoreClickTimer = window.setTimeout(() => {
                ignoreClick = false;
            }, 400);
        }
    }

    navbar.addEventListener("pointerup", event => release(event, true));
    navbar.addEventListener("pointercancel", event => release(event, false));

    // CLICK

    navbar.addEventListener("click", e => {

        const link = e.target.closest(".nav-link");

        if (!link) return;

        if (ignoreClick && !activatingDrop) {
            e.preventDefault();
            e.stopImmediatePropagation();
            ignoreClick = false;
            window.clearTimeout(ignoreClickTimer);
            return;
        }

        const index = navItems.indexOf(
            link.closest(".nav-item")
        );

        if (index >= 0) {
            updateLens(index);
        }

    }, true);

    // INITIAL POSITION

    updateLens(currentIndex, false);

    window.addEventListener("resize", () => {
        updateLens(currentIndex, false);
    });

});




// scroll down 

const navbar = document.querySelector(".liquid-navbar");

let lastScrollY = window.scrollY;
let ticking = false;

window.addEventListener("scroll", () => {
  
  if (ticking) return;
  
  ticking = true;
  
  requestAnimationFrame(() => {
    
    const currentScrollY = window.scrollY;
    
    // Scroll DOWN
    if (
      currentScrollY > lastScrollY &&
      currentScrollY > 80
    ) {
      
      navbar.classList.add("collapsed");
      
    }
    
    // Scroll UP
    else if (currentScrollY < lastScrollY) {
      
      navbar.classList.remove("collapsed");
      
    }
    
    // Top position
    if (currentScrollY <= 10) {
      
      navbar.classList.remove("collapsed");
      
    }
    
    lastScrollY = currentScrollY;
    
    ticking = false;
    
  });
  
}, { passive: true });

// water drop hide 

document.addEventListener("DOMContentLoaded", () => {
    const bubble = document.querySelector(".water-drop-bubble");
    
    if (!bubble) return;
    
    let lastScroll = window.scrollY;
    
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > lastScroll && currentScroll > 50) {
            // Scroll down: hide only liquid glass bubble
            bubble.style.opacity = "0";
        } else if (currentScroll < lastScroll || currentScroll <= 5) {
            // Scroll up: show bubble
            bubble.style.opacity = "1";
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
});

//water drop 

//Scroll Up



//icon🔻

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", function () {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.remove("active");
    });

    this.closest(".nav-item").classList.add("active");
  });
});


//icon🔺

//mouse cursor drag fuck🖕

document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".liquid-navbar");
    const bubble = document.querySelector(".water-drop-bubble");
    
    if (!navbar || !bubble) return;
    
    let dragging = false;
    let pointerId = null;
    
    navbar.addEventListener("pointerdown", (e) => {
        if (!e.target.closest(".nav-link")) return;
        
        dragging = true;
        pointerId = e.pointerId;
        
        navbar.setPointerCapture(pointerId);
        navbar.classList.add("is-dragging");
        bubble.style.transition = "none";
    });
    
    navbar.addEventListener("pointermove", (e) => {
        if (!dragging || e.pointerId !== pointerId) return;
        
        const navRect = navbar.getBoundingClientRect();
        const width = bubble.offsetWidth;
        
        const x = e.clientX - navRect.left - width / 2;
        
        bubble.style.transform = `translate3d(${x}px, -0%, 0)`;
    });
    
    function stopDragging(e) {
        if (!dragging || e.pointerId !== pointerId) return;
        
        dragging = false;
        pointerId = null;
        
        navbar.classList.remove("is-dragging");
        bubble.style.transition =
            "transform 0.35s cubic-bezier(.22,1,.36,1), width 0.35s ease";
    }
    
    navbar.addEventListener("pointerup", stopDragging);
    navbar.addEventListener("pointercancel", stopDragging);

    navbar.addEventListener("transitionend", (event) => {
        if (
            event.target !== navbar ||
            !["width", "left"].includes(event.propertyName)
        ) return;

        const activeItem = navbar.querySelector(".nav-item.active");
        if (!activeItem) return;

        const navRect = navbar.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const x = itemRect.left - navRect.left +
                  (itemRect.width - bubble.offsetWidth) / 2;

        bubble.style.transform = `translate3d(${x}px, 0, 0)`;
        bubble.style.opacity = "1";
    });
});

//mouse cursor drag fuck🖕


//Desktop Mode Automatic Change 

function autoDeviceMode() {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    
    document.documentElement.classList.toggle("desktop-mode", isDesktop);
    document.documentElement.classList.toggle("mobile-mode", !isDesktop);
}

autoDeviceMode();

window.addEventListener("resize", autoDeviceMode);
window.addEventListener("orientationchange", autoDeviceMode);

//Desktop Mode Automatic Change


//another link open In My Website

document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link || e.defaultPrevented) return;

    const viewer = document.getElementById("webViewer");
    const viewerFrame = document.getElementById("webFrame");
    if (!viewer || !viewerFrame) return;
    
    const url = new URL(link.href, location.href);
    
    if (
        url.origin === location.origin ||
        url.protocol !== "http:" && url.protocol !== "https:" ||
        link.target === "_blank" ||
        link.hasAttribute("download")
    ) return;
    
    e.preventDefault();
    
    viewer.style.display = "block";
    viewerFrame.src = url.href;
});

function closeViewer() {
    document.getElementById("webFrame").src = "about:blank";
    document.getElementById("webViewer").style.display = "none";
} 

//

document.addEventListener("DOMContentLoaded", () => {
    const iframe = document.getElementById("websiteFrame");
    const header = document.getElementById("glassHeader");
    
    if (!iframe || !header) return;
    
    function updateHeader() {
        const iframeOpen = getComputedStyle(iframe).display !== "none";
        
        header.classList.toggle("iframe-header", iframeOpen);
        
        if (iframeOpen) {
            header.style.display = "flex";
            header.style.zIndex = "10005";
        }
    }
    
    new MutationObserver(updateHeader).observe(iframe, {
        attributes: true,
        attributeFilter: ["style"]
    });
    
    updateHeader();
});


/*back button <!-- Website Internal Link Viewer -->  */


const nav = document.querySelector(".liquid-navbar");
const buttons = document.querySelectorAll(".iframe-glass-navbar");

// Active navigation button

buttons.forEach((button) => {
  button.addEventListener("click", () => {

    buttons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  });
});

// Smooth glass movement

let targetX = 0;
let targetY = 0;

let currentX = 0;
let currentY = 0;

nav.addEventListener("pointermove", (e) => {
  const rect = nav.getBoundingClientRect();

  targetX = ((e.clientX - rect.left) / rect.width - .5) * 8;
  targetY = ((e.clientY - rect.top) / rect.height - .5) * 8;
});

nav.addEventListener("pointerleave", () => {
  targetX = 0;
  targetY = 0;
});

// Animate liquid reflections

function animateGlass() {

  currentX += (targetX - currentX) * .08;
  currentY += (targetY - currentY) * .08;

  nav.style.setProperty("--glass-x", `${currentX}px`);
  nav.style.setProperty("--glass-y", `${currentY}px`);

  requestAnimationFrame(animateGlass);
}

animateGlass();
 
// Animate SVG liquid distortion

const turbulence = document.getElementById("turbulence");

let time = 0;

function liquidAnimation() {

  time += 0.008;

  const x = 0.018 + Math.sin(time) * 0.004;
  const y = 0.025 + Math.cos(time) * 0.004;

  turbulence.setAttribute(
    "baseFrequency",
    `${x} ${y}`
  );

  requestAnimationFrame(liquidAnimation);
}

liquidAnimation();
  
