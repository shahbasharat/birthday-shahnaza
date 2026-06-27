
// trigger to play music in the background with sweetalert
const startApp = () => {
    Swal.fire({
        title: 'Would you like some sweet music in the background? 🎵',
        text: "Turn up your volume for the best experience! ✨",
        showCancelButton: true,
        confirmButtonColor: '#ff69b4',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Yes, play! 🎶',
        cancelButtonText: 'No, silent',
        background: '#fff0f5',
        color: '#4a4a4a',
    }).then((result) => {
        if (result.isConfirmed) {
            const song = document.querySelector('.song');
            if (song) {
                song.play().catch(e => console.log("Audio play blocked:", e));
            }
        }
        animationTimeline();
    });
};

// Robust window load execution
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startApp();
} else {
    window.addEventListener('load', startApp);
}

// Polaroid interaction setup
const initPolaroids = () => {
    const cards = document.querySelectorAll('.polaroid-card');
    
    // Default rotations for the three cards to look organic
    const rotations = [-6, 4, -3];
    
    cards.forEach((card, index) => {
        // Reset flipped state
        const inner = card.querySelector('.polaroid-inner');
        if (inner) inner.classList.remove('flipped');
        
        // Apply organic rotation and reset positions
        const rot = rotations[index % rotations.length];
        card.style.transform = `translate(0px, 0px) rotate(${rot}deg)`;
        card.style.zIndex = index + 1;
        
        // Store translation state on the card object for dragging
        card.dataset.x = "0";
        card.dataset.y = "0";
        card.dataset.rot = rot.toString();
        card.dataset.tempX = "0";
        card.dataset.tempY = "0";
        
        // Dragging variables
        let startX = 0, startY = 0;
        let dragX = 0, dragY = 0;
        let isPointerDown = false;
        
        card.addEventListener('pointerdown', (e) => {
            isPointerDown = true;
            startX = e.clientX;
            startY = e.clientY;
            dragX = parseFloat(card.dataset.x) || 0;
            dragY = parseFloat(card.dataset.y) || 0;
            
            // Bring card to top of stack
            cards.forEach(c => c.style.zIndex = parseInt(c.style.zIndex) === 10 ? 9 : c.style.zIndex);
            card.style.zIndex = 10;
            
            card.classList.add('dragging');
            card.style.cursor = 'grabbing';
            card.setPointerCapture(e.pointerId);
        });
        
        card.addEventListener('pointermove', (e) => {
            if (!isPointerDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const newX = dragX + dx;
            const newY = dragY + dy;
            
            card.style.transform = `translate(${newX}px, ${newY}px) rotate(${card.dataset.rot}deg)`;
            
            // Save temp values
            card.dataset.tempX = newX.toString();
            card.dataset.tempY = newY.toString();
        });
        
        const handlePointerUp = (e) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            card.classList.remove('dragging');
            card.style.cursor = 'grab';
            card.releasePointerCapture(e.pointerId);
            
            // Update stored position
            const finalX = parseFloat(card.dataset.tempX) || dragX;
            const finalY = parseFloat(card.dataset.tempY) || dragY;
            card.dataset.x = finalX.toString();
            card.dataset.y = finalY.toString();
            
            // Calculate total distance dragged to detect click vs drag
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 6) {
                // It's a click, flip the card!
                const inner = card.querySelector('.polaroid-inner');
                if (inner) {
                    inner.classList.toggle('flipped');
                }
            }
        };
        
        card.addEventListener('pointerup', handlePointerUp);
        card.addEventListener('pointercancel', handlePointerUp);
        
        // Set initial pointer grab cursor
        card.style.cursor = 'grab';
    });
};

// animation timeline
const animationTimeline = () => {
    // Initialize Polaroid states
    initPolaroids();

    // Initialize Date Planner
    setupDatePlanner();

    // split chars that needs to be animated individually
    const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
    const hbd = document.getElementsByClassName("wish-hbd")[0];

    // Using Array.from to correctly handle emoji surrogate pairs
    const textBoxText = Array.from(textBoxChars.textContent.trim());
    textBoxChars.innerHTML = textBoxText.map(char => `<span>${char}</span>`).join("");

    hbd.innerHTML = hbd.innerHTML
        .split(/<br\s*\/?>/i)
        .map(line => Array.from(line).map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`).join(""))
        .join("<br>");

    const ideaTextTrans = {
        opacity: 0,
        y: -15,
        rotationX: 5,
        skewX: "10deg"
    };

    const ideaTextTransLeave = {
        opacity: 0,
        y: 15,
        rotationY: 5,
        skewX: "-10deg"
    };

    // timeline (GSAP 3 syntax)
    const tl = gsap.timeline(); window.tl = tl;

    tl.to(".container", {
        duration: 0.5,
        visibility: "visible"
    })
    .from(".section-one .one", {
        duration: 0.5,
        opacity: 0,
        y: 10
    })
    .from(".two", {
        duration: 0.3,
        opacity: 0,
        y: 10
    })
    .to(".section-one .one", {
        duration: 0.5,
        opacity: 0,
        y: 10
    }, "+=1.5")
    .to(".two", {
        duration: 0.5,
        opacity: 0,
        y: 10
    }, "-=0.5")
    .from(".three", {
        duration: 0.5,
        opacity: 0,
        y: 10
    })
    .to(".three", {
        duration: 0.5,
        opacity: 0,
        y: 10
    }, "+=1.2")
    .from(".four", {
        duration: 0.5,
        scale: 0.2,
        opacity: 0
    })
    .from(".text-box .fake-btn", {
        duration: 0.2,
        scale: 0.2,
        opacity: 0
    })
    .to(".hbd-chatbox span", {
        duration: 0.8,
        visibility: "visible",
        stagger: 0.02
    })
    .to(".text-box .fake-btn", {
        duration: 0.1,
        backgroundColor: "rgb(127, 206, 248)"
    }, "+=1.5")
    .to(".four", {
        duration: 0.4,
        scale: 0.2,
        opacity: 0,
        y: -120
    }, "+=0.6")
    .from(".idea-1", { duration: 0.4, ...ideaTextTrans })
    .to(".idea-1", { duration: 0.4, ...ideaTextTransLeave }, "+=0.8")
    .from(".idea-2", { duration: 0.4, ...ideaTextTrans })
    .to(".idea-2", { duration: 0.4, ...ideaTextTransLeave }, "+=0.8")
    .from(".idea-3", { duration: 0.4, ...ideaTextTrans })
    .to(".idea-3 strong", {
        duration: 0.3,
        scale: 1.15,
        x: 5,
        backgroundColor: "rgb(21, 161, 237)",
        color: "#fff"
    })
    .to(".idea-3", { duration: 0.4, ...ideaTextTransLeave }, "+=0.8")
    .from(".idea-4", { duration: 0.4, ...ideaTextTrans })
    .to(".idea-4", { duration: 0.4, ...ideaTextTransLeave }, "+=0.8")
    .from(".idea-5", {
        duration: 0.4,
        rotationX: 15,
        rotationZ: -10,
        skewY: "-5deg",
        y: 20,
        z: 10,
        opacity: 0
    }, "+=0.5")
    .to(".idea-5 span", {
        duration: 0.4,
        scale: 1.35,
        ease: "back.out(1.7)"
    }, "+=0.6")
    .to(".idea-5", {
        duration: 0.4,
        scale: 0.2,
        opacity: 0
    }, "+=0.8")
    .from(".idea-6 span", {
        duration: 0.5,
        scale: 3,
        opacity: 0,
        rotation: 15,
        ease: "expo.out",
        stagger: 0.1
    })
    .to(".idea-6 span", {
        duration: 0.5,
        scale: 3,
        opacity: 0,
        rotation: -15,
        ease: "expo.out",
        stagger: 0.1
    }, "+=0.7")
    .fromTo(".baloons img", {
        opacity: 0.9,
        y: 1400
    }, {
        duration: 1.8,
        opacity: 1,
        y: -1000,
        stagger: 0.1
    })
    .from(".profile-picture", {
        duration: 0.4,
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45
    }, "-=1.4")
    .from(".hat", {
        duration: 0.4,
        x: -100,
        y: 350,
        rotation: -180,
        opacity: 0
    }, "-=1.1")
    .from(".wish-hbd span", {
        duration: 0.5,
        opacity: 0,
        y: -50,
        rotation: 150,
        skewX: "30deg",
        ease: "elastic.out(1, 0.5)",
        stagger: 0.05
    }, "-=0.8")
    .fromTo(".wish-hbd span", {
        scale: 1.4,
        rotationY: 150
    }, {
        duration: 0.5,
        scale: 1,
        rotationY: 0,
        color: "#ff69b4",
        ease: "expo.out",
        stagger: 0.05
    }, "party")
    .from(".wish h5", {
        duration: 0.4,
        opacity: 0,
        y: 10,
        skewX: "-15deg"
    }, "party")
    
    // Animate background circles in parallel without blocking the timeline
    .to(".eight svg", {
        duration: 1.0,
        visibility: "visible",
        opacity: 0,
        scale: 80,
        repeat: 3,
        repeatDelay: 1.0,
        stagger: 0.2
    }, "party")
    
    // Proceed to fade out the wishes slide and fade in Polaroids after 2.2 seconds
    .to(".six", {
        duration: 0.4,
        opacity: 0,
        y: 30,
        zIndex: -1
    }, "party+2.2")
    
    // Polaroid Gallery Entrance
    .fromTo(".seven-polaroids", {
        opacity: 0,
        y: 50,
        visibility: "hidden"
    }, {
        duration: 0.6,
        opacity: 1,
        y: 0,
        visibility: "visible"
    })
    .from(".polaroid-card", {
        duration: 0.5,
        scale: 0.5,
        opacity: 0,
        rotation: -45,
        stagger: 0.12
    })
    .fromTo("#polaroidsDoneBtn", {
        opacity: 0,
        scale: 0.2
    }, {
        duration: 0.3,
        opacity: 1,
        scale: 1
    })
    .addPause("+=0.1") // PAUSE the timeline here for user interaction
    
    // Timeline resumes when continueBtn is clicked
    .to(".seven-polaroids", {
        duration: 0.4,
        opacity: 0,
        y: 30,
        zIndex: -1
    })
    .to(".container > div:not(.nine):not(.seven):not(.eight)", {
        duration: 0.1,
        visibility: "hidden"
    })
    .fromTo(".nine", {
        opacity: 0,
        y: 30,
        visibility: "hidden"
    }, {
        duration: 0.6,
        opacity: 1,
        y: 0,
        visibility: "visible"
    })
    .from(".date-planner-container", {
        duration: 0.6,
        scale: 0.8,
        opacity: 0,
        ease: "back.out(1.2)"
    })
    .from(".nine-footer", {
        duration: 0.5,
        opacity: 0,
        y: 15
    });

    // Continue button callback to resume GSAP timeline
    const continueBtn = document.getElementById("polaroidsDoneBtn");
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            tl.play();
        });
    }

    // Restart Animation on click
    const replayBtn = document.getElementById("replay");
    if (replayBtn) {
        replayBtn.addEventListener("click", () => {
            initPolaroids();
            // Reset planner states too
            const startOverBtn = document.getElementById('startOverBtn');
            if (startOverBtn) startOverBtn.click();
            tl.restart();
        });
    }
};

// Date Planner Logic Flow
const setupDatePlanner = () => {
    let selectedDay = null;
    let selectedFoods = [];
    let selectedTime = null;
    let selectedTimeLabel = null;

    const showStep = (stepId) => {
        const steps = document.querySelectorAll('.planner-step');
        steps.forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });
        const activeStep = document.getElementById(stepId);
        if (activeStep) {
            activeStep.style.display = 'flex';
            activeStep.offsetHeight; // trigger reflow
            activeStep.classList.add('active');
        }
    };

    // 1. Runaway No button
    const noBtn = document.getElementById('noBtn');
    if (noBtn) {
        const moveNoBtn = () => {
            const container = document.querySelector('.date-planner-container');
            const containerRect = container.getBoundingClientRect();
            const btnRect = noBtn.getBoundingClientRect();
            
            const maxX = containerRect.width - btnRect.width - 25;
            const maxY = containerRect.height - btnRect.height - 25;
            
            const randX = Math.max(12, Math.random() * maxX);
            const randY = Math.max(12, Math.random() * maxY);
            
            noBtn.style.position = 'absolute';
            noBtn.style.left = `${randX}px`;
            noBtn.style.top = `${randY}px`;
        };
        noBtn.addEventListener('mouseenter', moveNoBtn);
        noBtn.addEventListener('pointerover', moveNoBtn);
        noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveNoBtn();
        });
    }

    const yesBtn = document.getElementById('yesBtn');
    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            showStep('step-calendar');
        });
    }

    // 2. August 2026 Calendar Generation
    const calendarDays = document.getElementById('calendarDays');
    const toFoodBtn = document.getElementById('toFoodBtn');
    if (calendarDays && toFoodBtn) {
        calendarDays.innerHTML = '';
        
        // August 1, 2026 is a Saturday (index 6, Sunday is 0)
        // Add 6 empty slots
        for (let i = 0; i < 6; i++) {
            const emptyCell = document.createElement('span');
            emptyCell.className = 'calendar-day empty';
            calendarDays.appendChild(emptyCell);
        }
        
        // Add 31 days
        for (let day = 1; day <= 31; day++) {
            const dayCell = document.createElement('span');
            dayCell.className = 'calendar-day';
            dayCell.textContent = day.toString();
            
            // Highlight August 1st (Shahnaza's Birthday!)
            if (day === 1) {
                dayCell.classList.add('birthday-highlight');
                dayCell.setAttribute('title', "Shahnaza's Birthday! 🎂");
            }
            
            dayCell.addEventListener('click', () => {
                document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
                dayCell.classList.add('selected');
                selectedDay = day;
                toFoodBtn.disabled = false;
            });
            calendarDays.appendChild(dayCell);
        }
        
        toFoodBtn.addEventListener('click', () => {
            showStep('step-food');
        });
    }

    // 3. Food Grid selection
    const foodItems = document.querySelectorAll('.food-item');
    const toTimeBtn = document.getElementById('toTimeBtn');
    if (foodItems.length > 0 && toTimeBtn) {
        foodItems.forEach(item => {
            item.addEventListener('click', () => {
                const food = item.getAttribute('data-food');
                if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                    selectedFoods = selectedFoods.filter(f => f !== food);
                } else {
                    item.classList.add('selected');
                    selectedFoods.push(food);
                }
                toTimeBtn.disabled = selectedFoods.length === 0;
            });
        });
        
        toTimeBtn.addEventListener('click', () => {
            showStep('step-time');
        });
    }

    // 4. Time Slot Selection
    const timeOptions = document.querySelectorAll('.time-option');
    const toSummaryBtn = document.getElementById('toSummaryBtn');
    const customTimePickerContainer = document.getElementById('customTimePickerContainer');
    const customTimeInput = document.getElementById('customTimeInput');

    if (timeOptions.length > 0 && toSummaryBtn) {
        timeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                timeOptions.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                const timeVal = opt.getAttribute('data-time');
                selectedTimeLabel = opt.getAttribute('data-label');
                
                if (timeVal === 'custom') {
                    if (customTimePickerContainer) customTimePickerContainer.style.display = 'flex';
                    if (customTimeInput && customTimeInput.value) {
                        selectedTime = formatCustomTime(customTimeInput.value);
                        toSummaryBtn.disabled = false;
                    } else {
                        selectedTime = null;
                        toSummaryBtn.disabled = true;
                    }
                } else {
                    if (customTimePickerContainer) customTimePickerContainer.style.display = 'none';
                    selectedTime = timeVal;
                    toSummaryBtn.disabled = false;
                }
            });
        });
        
        if (customTimeInput) {
            customTimeInput.addEventListener('input', () => {
                if (customTimeInput.value) {
                    selectedTime = formatCustomTime(customTimeInput.value);
                    toSummaryBtn.disabled = false;
                } else {
                    toSummaryBtn.disabled = true;
                }
            });
        }
        
        toSummaryBtn.addEventListener('click', () => {
            updateSummary();
            showStep('step-summary');
        });
    }

    // 12-hour AM/PM converter helper
    const formatCustomTime = (time24) => {
        if (!time24) return '';
        const [hourStr, minStr] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        const min = minStr;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; // 0 becomes 12
        return `${hour}:${min} ${ampm}`;
    };

    // 5. Update Summary & Google Calendar URL
    const updateSummary = () => {
        const sumWhen = document.getElementById('sumWhen');
        const sumWhat = document.getElementById('sumWhat');
        const calendarLink = document.getElementById('calendarLink');

        if (!selectedDay || !selectedTime || selectedFoods.length === 0) return;

        // Day of week calculation for August 2026
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dateObj = new Date(2026, 7, selectedDay); // August
        const dayName = daysOfWeek[dateObj.getDay()];
        const dateStr = `${dayName}, August ${selectedDay}, 2026 at ${selectedTime}`;
        
        if (sumWhen) sumWhen.textContent = dateStr;
        
        const foodsStr = selectedFoods.join(' & ');
        if (sumWhat) sumWhat.textContent = foodsStr;

        // Build Google Calendar template link
        const doubleDay = selectedDay.toString().padStart(2, '0');
        
        let startHour = '190000';
        let endHour = '210000';
        
        if (selectedTime) {
            const match = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (match) {
                let h = parseInt(match[1], 10);
                const m = match[2];
                const p = match[3].toUpperCase();
                if (p === 'PM' && h < 12) h += 12;
                if (p === 'AM' && h === 12) h = 0;
                
                const startStr = h.toString().padStart(2, '0') + m + '00';
                const endH = (h + 2) % 24;
                const endStr = endH.toString().padStart(2, '0') + m + '00';
                startHour = startStr;
                endHour = endStr;
            }
        }

        const title = encodeURIComponent('Birthday Celebration Date with Shahnaza! 🎂✨');
        const details = encodeURIComponent(`Craving: ${foodsStr}! Planned with love.`);
        const location = encodeURIComponent('Your Favorite Spot');
        const dateParam = `202608${doubleDay}T${startHour}/202608${doubleDay}T${endHour}`;
        
        const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateParam}&details=${details}&location=${location}`;
        if (calendarLink) calendarLink.href = gCalUrl;
    };

    // Fetch helper with timeout limit
    const fetchWithTimeout = async (resource, options = {}) => {
        const { timeout = 5000 } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        clearTimeout(id);
        
        return response;
    };

    // 5.5 Confirm Date Email notification (SMTP Post)
    const confirmBtn = document.getElementById('confirmBtn');
    const successMessage = document.getElementById('successMessage');
    const fallbackMessage = document.getElementById('fallbackMessage');
    const waShareBtn = document.getElementById('waShareBtn');
    const calendarLink = document.getElementById('calendarLink');

    if (confirmBtn && successMessage && fallbackMessage) {
        confirmBtn.addEventListener('click', () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Sending Confirmation...';
            
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dateObj = new Date(2026, 7, selectedDay);
            const dayName = daysOfWeek[dateObj.getDay()];
            const dateStr = `${dayName}, August ${selectedDay}, 2026 at ${selectedTime}`;
            const foodsStr = selectedFoods.join(' & ');
            
            const emailBody = `Hey! Shahnaza has planned our Birthday Celebration Date! 🎂✨\n\n📅 When: ${dateStr}\n🍔 Cravings: ${foodsStr}\n\nEverything is set! Get ready for a wonderful day. 💖`;
            
            // Prefill fallback WhatsApp link
            const shareText = `Hey! I planned our Birthday Celebration Date! 🎂✨\n\n📅 When: ${dateStr}\n🍔 Cravings: ${foodsStr}\n\nEverything is set! Get ready for a wonderful day. 💖`;
            if (waShareBtn) {
                waShareBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            }
            
            // Use absolute URL for local testing via file:// protocol
            const endpoint = window.location.protocol === 'file:' 
                ? 'http://localhost:8000/api/submit-date' 
                : '/api/submit-date';
                
            fetchWithTimeout(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    date: dateStr,
                    cravings: foodsStr
                }),
                timeout: 10000 // 10 seconds timeout for Vercel cold starts before WhatsApp fallback
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    confirmBtn.style.display = 'none';
                    if (calendarLink) calendarLink.style.display = 'inline-block';
                    successMessage.style.display = 'block';
                } else {
                    throw new Error(json.message || 'Server error');
                }
            })
            .catch(error => {
                console.log("Email confirmation error/timeout, using WhatsApp fallback:", error);
                confirmBtn.style.display = 'none';
                if (calendarLink) calendarLink.style.display = 'inline-block';
                fallbackMessage.style.display = 'block';
            });
        });
    }

    // 6. Reset & Start Over
    const startOverBtn = document.getElementById('startOverBtn');
    if (startOverBtn) {
        startOverBtn.addEventListener('click', () => {
            // Reset states
            selectedDay = null;
            selectedFoods = [];
            selectedTime = null;
            selectedTimeLabel = null;

            // Reset UI selections
            document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
            document.querySelectorAll('.food-item').forEach(f => f.classList.remove('selected'));
            document.querySelectorAll('.time-option').forEach(t => t.classList.remove('selected'));

            // Disable buttons
            if (toFoodBtn) toFoodBtn.disabled = true;
            if (toTimeBtn) toTimeBtn.disabled = true;
            if (toSummaryBtn) toSummaryBtn.disabled = true;

            // Reset success UI
            if (successMessage) successMessage.style.display = 'none';
            if (fallbackMessage) fallbackMessage.style.display = 'none';
            if (confirmBtn) {
                confirmBtn.style.display = 'inline-block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm Date 💖';
            }
            if (calendarLink) calendarLink.style.display = 'none';
            if (customTimePickerContainer) customTimePickerContainer.style.display = 'none';
            if (customTimeInput) customTimeInput.value = '';

            // Reset runway No button position
            if (noBtn) {
                noBtn.style.position = '';
                noBtn.style.left = '';
                noBtn.style.top = '';
            }

            showStep('step-proposal');
        });
    }
};
