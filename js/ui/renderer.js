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
        
        const leftMeta = document.createElement('div');
        leftMeta.style.display = 'flex';
        leftMeta.style.alignItems = 'center';
        leftMeta.style.gap = '0.75rem';

        const qBadge = document.createElement('span');
        qBadge.className = 'question-number-badge';
        qBadge.textContent = `Q${questionNumber}`;

        const categoryTag = document.createElement('span');
        categoryTag.textContent = questionObj.category;
        
        const providerChip = document.createElement('span');
        providerChip.className = 'provider-chip';
        providerChip.textContent = `via ${questionObj.provider}`;

        leftMeta.appendChild(qBadge);
        leftMeta.appendChild(categoryTag);
        leftMeta.appendChild(providerChip);

        const difficultyPill = document.createElement('span');
        difficultyPill.className = `difficulty-pill ${questionObj.difficulty}`;
        difficultyPill.textContent = questionObj.difficulty;

        meta.appendChild(leftMeta);
        meta.appendChild(difficultyPill);

        this.container.appendChild(meta);

        // Question Container
        const qContainer = document.createElement('div');
        qContainer.style.display = 'flex';
        qContainer.style.justifyContent = 'space-between';
        qContainer.style.alignItems = 'flex-start';
        qContainer.style.gap = '1rem';

        // Question Text
        const text = document.createElement('h2');
        text.className = 'question-text';
        text.tabIndex = -1; // For focus management
        text.textContent = questionObj.question;
        text.style.margin = '0';

        // Search Link
        const searchLink = document.createElement('a');
        searchLink.href = `https://www.google.com/search?q=${encodeURIComponent(questionObj.question)}`;
        searchLink.target = '_blank';
        searchLink.rel = 'noopener noreferrer';
        searchLink.className = 'icon-btn';
        searchLink.title = 'Learn more on Google';
        searchLink.setAttribute('aria-label', 'Search question on Google');
        searchLink.textContent = '🔍';
        searchLink.style.textDecoration = 'none';
        searchLink.style.flexShrink = '0';
        searchLink.style.color = 'inherit';

        qContainer.appendChild(text);
        qContainer.appendChild(searchLink);
        this.container.appendChild(qContainer);

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
