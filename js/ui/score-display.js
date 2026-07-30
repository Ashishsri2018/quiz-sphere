export class ScoreDisplay {
    constructor() {
        this.elCorrect = document.getElementById('val-correct');
        this.elWrong = document.getElementById('val-wrong');
        this.elStreak = document.getElementById('stat-streak');
        this.elBest = document.getElementById('stat-best');
        this.elAcc = document.getElementById('stat-acc');
        
        this.chipStreak = document.getElementById('stat-streak-chip');
        this.chipBest = document.getElementById('stat-best-chip');
        this.chipAcc = document.getElementById('stat-acc-chip');
    }

    update(score) {
        this.animateValue(this.elCorrect, score.correct);
        this.animateValue(this.elWrong, score.wrong);
        
        // Streak update
        this.animateValue(this.elStreak, score.streak);
        if (score.streak >= 3) {
            this.chipStreak.classList.add('streak-hot');
        } else {
            this.chipStreak.classList.remove('streak-hot');
        }

        // Milestone celebration
        if (score.streak > 0 && score.streak % 5 === 0) {
            this.chipStreak.classList.remove('streak-milestone');
            void this.chipStreak.offsetWidth; // trigger reflow
            this.chipStreak.classList.add('streak-milestone');
        }

        // Best Streak
        this.elBest.textContent = score.bestStreak;
        if (score.bestStreak > 0) {
            this.chipBest.style.display = 'flex';
        }

        // Accuracy
        const total = score.correct + score.wrong;
        const accuracy = total === 0 ? 0 : Math.round((score.correct / total) * 100);
        this.animateValue(this.elAcc, `${accuracy}%`);
        
        // Color code accuracy
        if (accuracy >= 70) {
            this.chipAcc.style.color = 'var(--accent-easy)';
        } else if (accuracy >= 40) {
            this.chipAcc.style.color = 'var(--accent-medium)';
        } else if (total > 0) {
            this.chipAcc.style.color = 'var(--accent-hard)';
        }
    }

    animateValue(element, newValue) {
        if (element.textContent !== String(newValue)) {
            element.textContent = newValue;
            element.style.transform = 'scale(1.3)';
            element.style.color = 'var(--accent-highlight)';
            element.style.display = 'inline-block';
            element.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    }
}
