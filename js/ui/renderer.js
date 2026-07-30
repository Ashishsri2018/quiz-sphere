export class Renderer {
    constructor(containerId, onAnswer) {
        this.container = document.getElementById(containerId);
        this.onAnswer = onAnswer;
        this.buttons = [];
        this.progressBar = null;
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="meta-info skeleton skeleton-text" style="width: 50%;"></div>
            <div class="question-text skeleton skeleton-text" style="height: 3rem; margin-bottom: 1.5rem;"></div>
            <div class="answers-grid">
                <div class="skeleton skeleton-btn"></div>
                <div class="skeleton skeleton-btn"></div>
                <div class="skeleton skeleton-btn"></div>
                <div class="skeleton skeleton-btn"></div>
            </div>
        `;
    }

    renderQuestion(questionObj, questionNumber) {
        this.container.innerHTML = '';
        this.container.classList.remove('card-enter');
        // trigger reflow
        void this.container.offsetWidth;
        this.container.classList.add('card-enter');

        // Meta Info
        const meta = document.createElement('div');
        meta.className = 'meta-info';
        meta.innerHTML = `
            <span>Q#${questionNumber} · ${questionObj.category}</span>
            <span>via ${questionObj.provider}</span>
        `;
        this.container.appendChild(meta);

        // Question Text
        const text = document.createElement('div');
        text.className = 'question-text';
        text.innerHTML = questionObj.question; // already decoded
        this.container.appendChild(text);

        // Answers
        const grid = document.createElement('div');
        grid.className = 'answers-grid';
        this.buttons = [];

        const labels = ['A', 'B', 'C', 'D'];

        questionObj.allAnswers.forEach((ans, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-answer';
            const label = questionObj.type === 'boolean' ? (idx===0?'T':'F') : labels[idx];
            btn.innerHTML = `<strong>${label}.</strong> <span>${ans}</span>`;
            
            btn.addEventListener('click', () => {
                // Disable all immediately
                this.buttons.forEach(b => b.disabled = true);
                this.onAnswer(idx);
            });

            this.buttons.push(btn);
            grid.appendChild(btn);
        });

        this.container.appendChild(grid);
    }

    showFeedback(selectedIndex, isCorrect, correctAnswerIndex) {
        const btn = this.buttons[selectedIndex];
        
        if (isCorrect) {
            btn.classList.add('correct');
            btn.classList.add('anim-correct');
            btn.innerHTML += ' <span style="margin-left:auto">✓</span>';
        } else {
            btn.classList.add('wrong');
            btn.classList.add('anim-wrong');
            btn.innerHTML += ' <span style="margin-left:auto">✗</span>';
            
            // Highlight the correct one too
            if (correctAnswerIndex !== -1 && this.buttons[correctAnswerIndex]) {
                this.buttons[correctAnswerIndex].classList.add('correct');
            }
        }

        // Add progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        progressContainer.appendChild(this.progressBar);
        this.container.appendChild(progressContainer);

        // Animate progress bar (takes exactly the delay duration)
        setTimeout(() => {
            this.progressBar.style.width = '100%';
            // Add a CSS transition duration directly
            this.progressBar.style.transitionDuration = '1.5s';
        }, 50);
    }
}
