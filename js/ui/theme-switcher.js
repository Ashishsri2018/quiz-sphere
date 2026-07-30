export class ThemeSwitcher {
    constructor(buttonId) {
        this.button = document.getElementById(buttonId);
        this.STORAGE_KEY = 'quiz-theme';
        this.themes = [
            { id: 'midnight', name: 'Midnight', color: '#7c4dff' },
            { id: 'ocean',    name: 'Ocean Deep', color: '#00b4d8' },
            { id: 'aurora',   name: 'Aurora', color: '#58a6ff' },
            { id: 'ember',    name: 'Ember', color: '#ff6b35' },
            { id: 'forest',   name: 'Forest', color: '#00e676' },
            { id: 'neon',     name: 'Neon', color: '#e040fb' },
            { id: 'light',    name: 'Light', color: '#6c5ce7' }
        ];
        
        this.currentTheme = localStorage.getItem(this.STORAGE_KEY) || 'midnight';
        this.applyTheme(this.currentTheme, false);
        
        if (this.button) {
            this.renderDropdown();
            this.setupEvents();
        }
    }

    applyTheme(themeId, transition = true) {
        if (transition) {
            document.documentElement.classList.add('theme-transitioning');
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 400);
        }
        
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem(this.STORAGE_KEY, themeId);
        this.currentTheme = themeId;
        
        if (this.dropdown) {
            this.updateDropdownState();
        }
    }

    renderDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'theme-dropdown card';
        this.dropdown.style.display = 'none';
        
        const list = document.createElement('div');
        list.className = 'theme-list';
        
        this.themes.forEach(theme => {
            const btn = document.createElement('button');
            btn.className = 'theme-option';
            btn.setAttribute('data-theme-id', theme.id);
            btn.innerHTML = `
                <span class="theme-swatch" style="background-color: ${theme.color};"></span>
                <span class="theme-name">${theme.name}</span>
                <span class="theme-check">✓</span>
            `;
            
            btn.addEventListener('click', () => {
                this.applyTheme(theme.id);
                this.close();
            });
            
            list.appendChild(btn);
        });
        
        this.dropdown.appendChild(list);
        
        // Append to parent of button (the header actions div)
        this.button.parentNode.style.position = 'relative';
        this.button.parentNode.appendChild(this.dropdown);
        
        this.updateDropdownState();
    }
    
    updateDropdownState() {
        const options = this.dropdown.querySelectorAll('.theme-option');
        options.forEach(opt => {
            if (opt.getAttribute('data-theme-id') === this.currentTheme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    setupEvents() {
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        document.addEventListener('click', (e) => {
            if (this.dropdown.style.display !== 'none' && !this.dropdown.contains(e.target) && e.target !== this.button) {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.dropdown.style.display === 'none') {
            this.open();
        } else {
            this.close();
        }
    }
    
    open() {
        this.dropdown.style.display = 'block';
        // Add animation class if needed
    }
    
    close() {
        this.dropdown.style.display = 'none';
    }
}
