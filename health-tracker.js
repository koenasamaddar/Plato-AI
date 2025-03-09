document.addEventListener('DOMContentLoaded', () => {
    let healthScore = 0;
    let waterGlasses = 0;
    let waterStreak = 0;
    let exerciseTimer = null;
    let exerciseTime = 1800; // 30 minutes
    const achievements = new Set();

    // Exercise Timer
    const timerDisplay = document.querySelector('.timer-display');
    const startTimerBtn = document.querySelector('.start-timer');
    
    function updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    startTimerBtn.addEventListener('click', () => {
        const exerciseMascot = startTimerBtn.closest('.health-tip-card').querySelector('.blood-drop');
        
        if (!exerciseTimer) {
            exerciseTimer = setInterval(() => {
                exerciseTime--;
                updateTimer(exerciseTime);
                
                if (exerciseTime <= 0) {
                    clearInterval(exerciseTimer);
                    exerciseTimer = null;
                    exerciseTime = 1800;
                    startTimerBtn.textContent = 'Start Exercise Timer';
                    exerciseMascot.src = '/static/images/blood-drops/celebrate.svg';
                    createAchievement('Exercise Master', 'Completed a 30-minute workout!');
                    showConfetti(startTimerBtn);
                    setTimeout(() => {
                        exerciseMascot.src = '/static/images/blood-drops/happy.svg';
                    }, 2000);
                }
            }, 1000);
            
            startTimerBtn.textContent = 'Stop Timer';
            exerciseMascot.src = '/static/images/blood-drops/excited.svg';
            exerciseMascot.classList.add('bounce');
        } else {
            clearInterval(exerciseTimer);
            exerciseTimer = null;
            exerciseTime = 1800;
            updateTimer(exerciseTime);
            startTimerBtn.textContent = 'Start Exercise Timer';
            exerciseMascot.src = '/static/images/blood-drops/tip.svg';
            exerciseMascot.classList.remove('bounce');
        }
    });

    // Water Tracker
    const addWaterBtn = document.querySelector('.add-water');
    const waterLevel = document.querySelector('.water-level');
    const glassCountDisplay = document.getElementById('glassCount');
    const streakCountDisplay = document.getElementById('streakCount');
    
    addWaterBtn.addEventListener('click', () => {
        if (waterGlasses < 8) {
            waterGlasses++;
            const percentage = (waterGlasses / 8) * 100;
            waterLevel.style.height = `${percentage}%`;
            glassCountDisplay.textContent = `${waterGlasses}/8`;
            
            const waterMascot = addWaterBtn.closest('.health-tip-card').querySelector('.blood-drop');
            waterMascot.src = '/static/images/blood-drops/happy.svg';
            waterMascot.classList.add('bounce');
            
            if (waterGlasses === 8) {
                waterStreak++;
                streakCountDisplay.textContent = waterStreak;
                createAchievement('Hydration Hero', 'Reached daily water goal!');
                showConfetti(addWaterBtn);
                
                if (waterStreak >= 7) {
                    createAchievement('Hydration Master', 'Maintained hydration for a week!');
                }
            }
            
            setTimeout(() => {
                waterMascot.src = '/static/images/blood-drops/tip.svg';
                waterMascot.classList.remove('bounce');
            }, 1000);
            
            updateHealthScore();
        }
    });

    // Food and Vitamin Tracking
    const foodItems = document.querySelectorAll('.food-item input, .vitamin-item input');
    foodItems.forEach(item => {
        item.addEventListener('change', (e) => {
            const mascot = e.target.closest('.health-tip-card').querySelector('.blood-drop');
            if (e.target.checked) {
                mascot.src = '/static/images/blood-drops/happy.svg';
                mascot.classList.add('bounce');
                
                const allChecked = Array.from(e.target.closest('.food-tracker, .vitamin-tracker')
                    .querySelectorAll('input[type="checkbox"]'))
                    .every(checkbox => checkbox.checked);
                
                if (allChecked) {
                    const type = e.target.closest('.vitamin-tracker') ? 'Vitamin' : 'Nutrition';
                    createAchievement(`${type} Champion`, `Completed all ${type.toLowerCase()} goals!`);
                    showConfetti(e.target);
                }
            }
            
            setTimeout(() => {
                mascot.src = '/static/images/blood-drops/tip.svg';
                mascot.classList.remove('bounce');
            }, 1000);
            
            updateHealthScore();
        });
    });

    // Day Circle Tracking
    const dayCircles = document.querySelectorAll('.day-circle');
    let completedDays = 0;
    
    dayCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            circle.classList.toggle('completed');
            completedDays = document.querySelectorAll('.day-circle.completed').length;
            
            if (circle.classList.contains('completed')) {
                createAchievement('Active Day', 'Marked a day as complete!');
                
                if (completedDays >= 7) {
                    createAchievement('Perfect Week', 'Completed all activities for the week!');
                    showConfetti(circle);
                }
            }
            
            updateHealthScore();
        });
    });

    // Health Score Calculation
    function updateHealthScore() {
        const waterScore = (waterGlasses / 8) * 100;
        const exerciseScore = (completedDays / 7) * 100;
        const foodScore = calculateTrackingScore('.food-item input');
        const vitaminScore = calculateTrackingScore('.vitamin-item input');
        
        healthScore = Math.round((waterScore + exerciseScore + foodScore + vitaminScore) / 4);
        document.getElementById('healthScore').textContent = healthScore;
        
        if (healthScore >= 80 && !achievements.has('Health Champion')) {
            createAchievement('Health Champion', 'Achieved excellent health score!');
            showConfetti(document.getElementById('healthScore'));
        }
    }

    function calculateTrackingScore(selector) {
        const items = document.querySelectorAll(selector);
        const checked = Array.from(items).filter(item => item.checked).length;
        return (checked / items.length) * 100;
    }

    // Achievement System
    function createAchievement(title, description) {
        if (achievements.has(title)) return;
        
        achievements.add(title);
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'col-md-4 mb-4';
        achievementDiv.innerHTML = `
            <div class="achievement-card">
                <img src="/static/images/blood-drops/celebrate.svg" class="achievement-icon blood-drop">
                <div class="achievement-info">
                    <h4 class="achievement-title">${title}</h4>
                    <p class="achievement-description">${description}</p>
                </div>
            </div>
        `;
        
        document.getElementById('achievementsList').appendChild(achievementDiv);
        
        const mainMascot = document.getElementById('mainMascot');
        mainMascot.src = '/static/images/blood-drops/celebrate.svg';
        mainMascot.classList.add('bounce');
        
        setTimeout(() => {
            mainMascot.src = '/static/images/blood-drops/happy.svg';
            mainMascot.classList.remove('bounce');
        }, 2000);
    }

    // Confetti Effect
    function showConfetti(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = ['#ff6b6b', '#ff8787', '#ffa8a8'][Math.floor(Math.random() * 3)];
            confetti.style.left = `${x}px`;
            confetti.style.top = `${y}px`;
            document.body.appendChild(confetti);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            const tx = Math.cos(angle) * 100 * Math.random();
            const ty = Math.sin(angle) * 100 * Math.random() - 50;
            
            confetti.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => confetti.remove();
        }
    }

    // Initialize health score
    updateHealthScore();
});
