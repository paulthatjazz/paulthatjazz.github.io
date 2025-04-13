// Variables to track state
let loadingScreen = null;
let mainContent = null;
let attribution = null;
let celestialBody = null;
let starsContainer = null;
let starsCreated = false;
let loadingComplete = false;
let cloudsCreated = false;

function updateBackground() {
    const hour = new Date().getHours();
    const body = document.body;
    
    // Define gradients for different times of day
    const gradients = {
        morning: 'linear-gradient(to bottom, #FFB6C1, #87CEEB, #1E90FF)', // 5am-11am
        afternoon: 'linear-gradient(to bottom, #87CEEB, #1E90FF, #000080)', // 11am-5pm
        evening: 'linear-gradient(to bottom, #FFA07A, #FF69B4, #4B0082)', // 5pm-8pm
        night: 'linear-gradient(to bottom, #191970, #000080, #000000)' // 8pm-5am
    };

    // Set the appropriate gradient based on the hour
    let currentGradient;
    let timeOfDay;
    
    if (hour >= 5 && hour < 11) {
        currentGradient = gradients.morning;
        timeOfDay = 'morning';
    } else if (hour >= 11 && hour < 17) {
        currentGradient = gradients.afternoon;
        timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 20) {
        currentGradient = gradients.evening;
        timeOfDay = 'evening';
    } else {
        currentGradient = gradients.night;
        timeOfDay = 'night';
    }
    
    // Apply gradient to body
    body.style.background = currentGradient;
    
    // Only update visual elements if loading is complete
    if (loadingComplete) {
        // Update sun or moon
        updateCelestialBody(timeOfDay, hour);
        
        // Manage stars
        updateStars(timeOfDay);
    }
}

function createStars() {
    if (starsCreated) return;
    
    // Create stars container if it doesn't exist
    if (!starsContainer) {
        starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        document.body.appendChild(starsContainer);
    }
    
    // Clear any existing stars
    starsContainer.innerHTML = '';
    
    // Define star types and their frequencies
    const starTypes = [
        { class: 'star-tiny', frequency: 100 },
        { class: 'star-small', frequency: 50 },
        { class: 'star-medium', frequency: 25 },
        { class: 'star-large', frequency: 10 },
        { class: 'star-bright', frequency: 5 }
    ];
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Create stars of each type
    starTypes.forEach(type => {
        for (let i = 0; i < type.frequency; i++) {
            const star = document.createElement('div');
            star.className = `star ${type.class}`;
            
            // Random position
            const left = Math.random() * viewportWidth;
            const top = Math.random() * viewportHeight * 0.7; // Keep stars in upper 70% of screen
            
            // Random opacity and delay for twinkling effect
            const baseOpacity = type.class === 'star-tiny' ? 0.5 + Math.random() * 0.3 : 0.7 + Math.random() * 0.3;
            const animationDelay = Math.random() * 5;
            
            star.style.left = `${left}px`;
            star.style.top = `${top}px`;
            star.style.opacity = baseOpacity.toString();
            
            if (type.class === 'star-large' || type.class === 'star-bright') {
                star.style.animationDelay = `${animationDelay}s`;
            }
            
            starsContainer.appendChild(star);
        }
    });
    
    starsCreated = true;
}

function updateStars(timeOfDay) {
    // Only create stars if loading is complete
    if (!starsCreated && loadingComplete) {
        createStars();
    }
    
    // Only manage stars visibility if they exist
    if (starsCreated) {
        // Show stars at night and evening, hide during day
        if (timeOfDay === 'night' || timeOfDay === 'evening') {
            // Show stars with a fade-in transition
            if (starsContainer) {
                starsContainer.style.opacity = (timeOfDay === 'night') ? '1' : '0.5';
            }
        } else {
            // Hide stars during the day
            if (starsContainer) {
                starsContainer.style.opacity = '0';
            }
        }
    }
}

function updateCelestialBody(timeOfDay, hour) {
    // Only create celestial body if loading is complete
    if (!loadingComplete) return;
    
    // Remove existing celestial body if it exists
    if (celestialBody) {
        celestialBody.remove();
    }
    
    // Create new celestial body based on time of day
    celestialBody = document.createElement('div');
    celestialBody.className = 'celestial';
    
    // Position calculation values
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let posX, posY;
    
    if (timeOfDay === 'morning' || timeOfDay === 'afternoon') {
        // Sun during day
        celestialBody.classList.add('sun');
        
        // Calculate sun position based on time (morning to afternoon progression)
        // Morning: sun rises from left
        // Afternoon: sun moves toward right
        if (timeOfDay === 'morning') {
            const progress = (hour - 5) / 6; // 5am to 11am mapped to 0-1
            posX = windowWidth * (0.2 + progress * 0.3); // 20% to 50% of screen width
            posY = windowHeight * (0.4 - progress * 0.3); // 40% to 10% of screen height (higher)
        } else {
            const progress = (hour - 11) / 6; // 11am to 5pm mapped to 0-1
            posX = windowWidth * (0.5 + progress * 0.3); // 50% to 80% of screen width
            posY = windowHeight * (0.1 + progress * 0.2); // 10% to 30% of screen height (lower)
        }
    } else {
        // Moon during evening/night
        celestialBody.classList.add('moon');
        
        // Make moon more prominent and clearly visible
        celestialBody.style.width = '70px';
        celestialBody.style.height = '70px';
        celestialBody.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.7), 0 0 80px rgba(255, 255, 255, 0.4)';
        
        // Calculate moon position based on time (evening to night progression)
        // Evening: moon rises from right
        // Night: moon moves across sky
        if (timeOfDay === 'evening') {
            const progress = (hour - 17) / 3; // 5pm to 8pm mapped to 0-1
            posX = windowWidth * (0.8 - progress * 0.2); // 80% to 60% of screen width
            posY = windowHeight * (0.4 - progress * 0.3); // 40% to 10% of screen height (higher)
        } else {
            // Night time - ensure moon is visible in a good position
            // Handle both 8pm-midnight and midnight-5am
            let progress;
            if (hour >= 20) {
                // 8pm to midnight (20-24)
                progress = (hour - 20) / 4; // Maps 8pm-midnight to 0-1
                posX = windowWidth * (0.6 - progress * 0.2); // 60% to 40% of screen width
            } else {
                // After midnight to 5am (0-5)
                progress = hour / 5; // Maps midnight-5am to 0-1
                posX = windowWidth * (0.4 - progress * 0.2); // 40% to 20% of screen width
            }
            
            // Keep moon high in the sky at night
            posY = windowHeight * 0.2; // Fixed at 20% from top
        }
    }
    
    // Set position
    celestialBody.style.left = `${posX}px`;
    celestialBody.style.top = `${posY}px`;
    
    // Add to document
    document.body.appendChild(celestialBody);
}

function createCloud(horizontalPosition = false) {
    // Skip creating clouds if loading is not complete
    if (!loadingComplete) return;
    
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    
    // Smaller clouds - random width between 80 and 180px
    const width = Math.random() * 100 + 80;
    // Height for cloud base (slightly taller proportion)
    const height = width * (Math.random() * 0.2 + 0.2); // 20-40% of width
    
    // Ensure clouds are visible in the top third of the screen
    const top = Math.random() * 25 + 8; // 8% to 33% from top
    
    // Random animation duration - slower for initial clouds, faster for new clouds
    const isInitial = horizontalPosition !== false;
    const duration = isInitial ? 
        Math.random() * 80 + 80 : // 80-160 seconds for initial clouds
        Math.random() * 60 + 40;  // 40-100 seconds for new clouds
    
    // Create main cloud puffs - more contained
    const beforeSize = width * (Math.random() * 0.2 + 0.4); // 40-60% of width
    const afterSize = width * (Math.random() * 0.2 + 0.3); // 30-50% of width
    
    // Position for cloud puffs - keep them closer to the main cloud
    const beforeTop = -(beforeSize * 0.5); // Less variable height
    const beforeLeft = width * 0.1;
    const afterTop = -(afterSize * 0.5);
    const afterLeft = width * 0.35;
    
    // Set cloud properties
    cloud.style.width = `${width}px`;
    cloud.style.height = `${height}px`;
    cloud.style.top = `${top}%`;
    
    // Apply transition for all clouds
    cloud.style.transition = `left ${duration}s linear`;
    
    // For initial clouds, distribute them across the screen
    // For new clouds, start off-screen to the left
    if (isInitial) {
        // Initial clouds are positioned based on the provided horizontal position parameter
        cloud.style.left = `${horizontalPosition}%`;
    } else {
        // New clouds move from left to right
        cloud.style.left = '-150px';
    }
    
    // Set CSS variables for puffs
    cloud.style.setProperty('--before-size', `${beforeSize}px`);
    cloud.style.setProperty('--after-size', `${afterSize}px`);
    cloud.style.setProperty('--before-top', `${beforeTop}px`);
    cloud.style.setProperty('--before-left', `${beforeLeft}px`);
    cloud.style.setProperty('--after-top', `${afterTop}px`);
    cloud.style.setProperty('--after-left', `${afterLeft}px`);
    
    // Add additional cloud puffs
    const puffCount = Math.floor(Math.random() * 3) + 3; // 3-5 additional puffs
    
    for (let i = 0; i < puffCount; i++) {
        // Mostly regular puffs with occasional variants
        const puffTypeRoll = Math.random();
        let puffType = 'cloud-puff';
        if (puffTypeRoll > 0.7) puffType = 'cloud-puff-large';
        else if (puffTypeRoll > 0.5) puffType = 'cloud-puff-small';
        
        const puff = document.createElement('div');
        puff.className = puffType;
        
        // Create smaller puff sizes
        const puffSize = width * (Math.random() * 0.15 + 0.15); // 15-30% of width
        
        // Position puffs more conservatively
        let puffTop, puffLeft;
        
        // Space puffs evenly across the cloud width
        puffLeft = (width * 0.7 * (i / puffCount)) + (width * 0.15);
        
        if (i % 2 === 0) {
            // Top puffs - but not too high
            puffTop = -(puffSize * (Math.random() * 0.5 + 0.2));
        } else {
            // Lower puffs
            puffTop = -(puffSize * 0.2);
        }
        
        const puffBottom = Math.random() * 2; // Small bottom variation
        
        puff.style.setProperty('--puff-size', `${puffSize}px`);
        puff.style.setProperty('--puff-top', `${puffTop}px`);
        puff.style.setProperty('--puff-left', `${puffLeft}px`);
        puff.style.setProperty('--puff-bottom', `${puffBottom}px`);
        
        cloud.appendChild(puff);
    }
    
    document.body.appendChild(cloud);
    
    // Animate all clouds - use different delays for initial vs. new clouds
    setTimeout(() => {
        cloud.style.left = '120%'; // Move beyond right edge to ensure full exit
    }, isInitial ? 100 : 50); // Slightly longer delay for initial clouds
    
    // Remove cloud after it has moved across the screen
    setTimeout(() => {
        cloud.remove();
    }, duration * 1000 + 1000); // Add a buffer to ensure animation completes
}

// Clear any existing clouds
document.querySelectorAll('.cloud').forEach(cloud => cloud.remove());

// Function to distribute clouds more naturally across the screen
function createInitialClouds() {
    // Only create clouds once and only when loading is complete
    if (cloudsCreated || !loadingComplete) return;
    cloudsCreated = true;
    
    // Calculate number of clouds based on window width
    const windowWidth = window.innerWidth;
    let numClouds;
    
    if (windowWidth <= 480) {
        numClouds = 3; // Fewer clouds for mobile
    } else if (windowWidth <= 768) {
        numClouds = 4;
    } else if (windowWidth <= 1200) {
        numClouds = 5;
    } else {
        numClouds = 6; // More clouds for large screens
    }
    
    // Create initial clouds at different horizontal positions
    for (let i = 0; i < numClouds; i++) {
        // Distribute clouds across the screen (15-85% range)
        const horizontalPosition = 15 + (70 * i / numClouds) + (Math.random() * 10 - 5);
        createCloud(horizontalPosition);
    }
}

// Function to hide the loading screen with a smooth transition
function hideLoadingScreen() {
    console.log('hideLoadingScreen called');
    
    // Set the loading complete flag
    loadingComplete = true;
    
    // Fade out the loading screen with CSS transition
    if (loadingScreen) {
        console.log('Adding hidden class to loading screen');
        // Add the hidden class which has the opacity transition
        loadingScreen.classList.add('hidden');
        
        // Remove from DOM after transition completes
        setTimeout(() => {
            console.log('Hiding loading screen completely');
            loadingScreen.style.display = 'none';
            
            console.log('Initializing visual elements');
            // Now create clouds and update visual elements
            createInitialClouds();
            createMovingClouds();
            
            // Update background to create stars and celestial body
            updateBackground();
            
            // Show the main content after loading is complete
            if (mainContent) {
                console.log('Showing main content');
                mainContent.classList.add('visible');
            } else {
                console.error('Main content element not found when trying to show it');
            }
            
            // Show the attribution text
            if (attribution) {
                console.log('Showing attribution');
                attribution.style.opacity = '1';
            }
        }, 1000); // Match this with the CSS transition time (1s in the CSS)
    } else {
        console.error('Loading screen element not found when trying to hide');
        // Still set up the visual elements even if loading screen wasn't found
        createInitialClouds();
        createMovingClouds();
        updateBackground();
        
        // Show main content even if loading screen wasn't found
        if (mainContent) {
            console.log('Showing main content (fallback)');
            mainContent.classList.add('visible');
        }
        
        // Show attribution even if loading screen wasn't found
        if (attribution) {
            attribution.style.opacity = '1';
        }
    }
}

// Handle window resize for celestial body positioning
window.addEventListener('resize', () => {
    if (celestialBody && loadingComplete) {
        // Force update of celestial body with current time
        updateBackground();
    }
    
    // Recreate stars on resize to ensure proper distribution
    if (loadingComplete) {
        starsCreated = false;
        createStars();
    }
});

// Apply background color without visual elements when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Set up initial variables - using querySelector with class
    loadingScreen = document.querySelector('.loading-screen');
    mainContent = document.querySelector('.main-content');
    attribution = document.querySelector('.attribution');
    
    if (loadingScreen) {
        console.log('Loading screen found');
    } else {
        console.error('Loading screen element not found');
    }
    
    if (mainContent) {
        console.log('Main content found');
        // Ensure it's initially hidden
        mainContent.classList.remove('visible');
    } else {
        console.error('Main content element not found');
    }
    
    if (attribution) {
        console.log('Attribution found');
        // Ensure it's initially hidden
        attribution.style.opacity = '0';
    }
    
    // Set initial state variables
    loadingComplete = false;
    starsCreated = false;
    cloudsCreated = false;
    
    // Apply just the background gradient without visual elements
    updateBackground();
    
    // Set up interval for background updates (but visual elements will only appear after loading)
    setInterval(updateBackground, 60000);
    
    // Wait a bit then hide loading screen
    console.log('Setting timeout to hide loading screen');
    setTimeout(hideLoadingScreen, 1500);
});

// Create new moving clouds every 5-10 seconds
const createMovingClouds = () => {
    // Only create clouds if loading is complete
    if (loadingComplete) {
        createCloud(false); // Create a moving cloud
        
        // Schedule next cloud creation only if loading is complete
        setTimeout(createMovingClouds, Math.random() * 5000 + 5000);
    }
}; 