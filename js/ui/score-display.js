export class ScoreDisplay {
    constructor() {
        this.elCorrect = document.getElementById('val-correct');
        this.elWrong = document.getElementById('val-wrong');
        this.elStreak = document.getElementById('stat-streak');
        this.elBest = document.getElementById('stat-best');
        this.elAcc = document.getElementById('stat-acc');
    }

    update(score) {
        this.animateValue(this.elCorrect, score.correct);
        this.animateValue(this.elWrong, score.wrong);
        
        const streakEmoji = score.streak >= 3 ? '🔥' : '⚡';
        this.elStreak.textContent = `${streakEmoji} Streak: ${score.streak}`;
        if (score.streak >= 3) {
            this.elStreak.style.color = '#ff9800';
            this.elStreak.style.fontWeight = 'bold';
        } else {
            this.elStreak.style.color = 'inherit';
            this.elStreak.style.fontWeight = 'normal';
        }

        this.elBest.textContent = `🏆 Best: ${score.bestStreak}`;
        
        const total = score.correct + score.wrong;
        const accuracy = total === 0 ? 0 : Math.round((score.correct / total) * 100);
        this.elAcc.textContent = `🎯 Accuracy: ${accuracy}%`;
    }

    animateValue(element, newValue) {
        if (element.textContent !== String(newValue)) {
            element.textContent = newValue;
            element.style.transform = 'scale(1.5)';
            element.style.color = 'var(--accent-highlight)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    }
}
