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
        
        const span1 = document.createElement('span');
        span1.textContent = `Q#${questionNumber} · ${questionObj.category}`;
        const span2 = document.createElement('span');
        span2.textContent = `via ${questionObj.provider}`;
        meta.appendChild(span1);
        meta.appendChild(span2);

        this.container.appendChild(meta);

        // Question Text
        const text = document.createElement('h2');
        text.className = 'question-text';
        text.tabIndex = -1; // For focus management
        text.textContent = questionObj.question;
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
            
            const strong = document.createElement('strong');
            strong.textContent = `${label}.`;
            const span = document.createElement('span');
            span.textContent = ans;
            btn.appendChild(strong);
            btn.appendChild(document.createTextNode(' '));
            btn.appendChild(span);
            
            btn.addEventListener('click', () => {
                // Disable all immediately
                this.buttons.forEach(b => b.disabled = true);
                this.onAnswer(idx);
            });

            this.buttons.push(btn);
            grid.appendChild(btn);
        });

        this.container.appendChild(grid);
        
        // Focus question text for screen readers
        setTimeout(() => {
            text.focus();
        }, 50);
    }

    showFeedback(selectedIndex, isCorrect, correctAnswerIndex) {
        const btn = this.buttons[selectedIndex];
        
        if (isCorrect) {
            btn.classList.add('correct');
            btn.classList.add('anim-correct');
            const icon = document.createElement('span');
            icon.style.marginLeft = 'auto';
            icon.textContent = '✓';
            btn.appendChild(icon);
        } else {
            btn.classList.add('wrong');
            btn.classList.add('anim-wrong');
            const icon = document.createElement('span');
            icon.style.marginLeft = 'auto';
            icon.textContent = '✗';
            btn.appendChild(icon);
            
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

        // Animate progress bar
        this.progressBar.style.transitionDuration = '1.5s';
        // Trigger reflow to ensure the transition takes effect before changing width
        void this.progressBar.offsetWidth;

        setTimeout(() => {
            this.progressBar.style.width = '100%';
        }, 50);
    }

    renderError(onRetry) {
        this.container.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '2rem';
        
        const h2 = document.createElement('h2');
        h2.textContent = 'Something went wrong';
        h2.style.marginBottom = '1rem';
        
        const p = document.createElement('p');
        p.textContent = 'We had trouble loading the next question. Please check your connection.';
        p.style.marginBottom = '1.5rem';
        p.style.color = 'var(--text-secondary)';
        
        const retryBtn = document.createElement('button');
        retryBtn.className = 'diff-pill active easy';
        retryBtn.textContent = 'Retry';
        retryBtn.style.margin = '0 auto';
        retryBtn.style.display = 'inline-block';
        retryBtn.addEventListener('click', onRetry);
        
        errorDiv.appendChild(h2);
        errorDiv.appendChild(p);
        errorDiv.appendChild(retryBtn);
        this.container.appendChild(errorDiv);
    }
}
