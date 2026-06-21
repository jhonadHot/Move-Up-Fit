function toggleSubmenu(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const li = link.parentElement;
    const submenu = li.querySelector('.submenu');
    if (submenu) submenu.classList.toggle('open');
}

window.addEventListener('load', function() {
    // ===== SIDEBAR TOGGLE =====
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.onclick = function(e) {
            e.stopPropagation();
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                menuToggle.textContent = '▶';
            } else {
                sidebar.classList.add('open');
                menuToggle.textContent = '◀';
            }
        };

        document.onclick = function(e) {
            if (sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                e.target !== menuToggle) {
                sidebar.classList.remove('open');
                menuToggle.textContent = '▶';
            }
        };
    }

    // Init selects after short delay to allow dynamic population
    setTimeout(function() {
        console.log('Iniciando custom selects...');
        var selects = document.querySelectorAll('select');
        console.log('Selects encontrados:', selects.length);
        initCustomSelects();
        console.log('Custom selects inicializados');
    }, 500);

    // Re-init after 1.5s to catch dynamically populated selects (Firebase data)
    setTimeout(function() {
        initCustomSelects();
    }, 1500);
});

// ===== CUSTOM SELECT POPUP =====
// Active popup reference
let _activePopup = null;
let _activeTrigger = null;

function closeAllPopups() {
    document.querySelectorAll('.custom-select-popup').forEach(function(p) {
        p.classList.remove('show');
    });
    document.querySelectorAll('.custom-select-trigger').forEach(function(t) {
        t.classList.remove('open');
    });
    _activePopup = null;
    _activeTrigger = null;
}

document.addEventListener('click', closeAllPopups);
document.addEventListener('touchstart', closeAllPopups);

function initCustomSelects() {
    // Target ALL selects on the page
    document.querySelectorAll('select').forEach(function(select) {
        if (select.dataset.customized) return;
        if (select.dataset.noCustom) return;
        // Skip hidden selects
        if (select.type === 'hidden') return;
        select.dataset.customized = '1';
        convertToCustomSelect(select);
    });
}

function convertToCustomSelect(select) {
    select.style.display = 'none';

    // Create wrapper preserving original styles
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    // Copy width/flex styles
    const origStyle = select.getAttribute('style') || '';
    if (origStyle.includes('flex')) {
        wrapper.style.flex = '1';
    }
    if (origStyle.includes('width')) {
        const w = origStyle.match(/width:\s*([^;]+)/);
        if (w) wrapper.style.width = w[1].trim();
    } else {
        wrapper.style.width = '100%';
    }

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // Trigger button
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('tabindex', '0');
    updateTriggerText(trigger, select);
    wrapper.appendChild(trigger);

    // Popup — attached to body
    const popup = document.createElement('div');
    popup.className = 'custom-select-popup';
    document.body.appendChild(popup);

    function updateTriggerText(t, s) {
        const opt = s.options[s.selectedIndex];
        if (opt && opt.value) {
            t.textContent = opt.text;
            t.style.color = '';
        } else {
            t.textContent = (opt && opt.text) ? opt.text : 'Selecione...';
            t.style.color = '#555';
        }
    }

    function buildOptions() {
        popup.innerHTML = '';
        Array.from(select.options).forEach(function(opt) {
            const item = document.createElement('div');
            item.className = 'custom-select-option' +
                (!opt.value ? ' placeholder' : '') +
                (opt.value === select.value ? ' selected' : '');
            item.textContent = opt.text;

            item.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                select.value = opt.value;
                updateTriggerText(trigger, select);
                closeAllPopups();
                select.dispatchEvent(new Event('change', { bubbles: true }));
            });

            popup.appendChild(item);
        });
    }

    function openPopup(e) {
        e.stopPropagation();

        if (popup.classList.contains('show')) {
            closeAllPopups();
            return;
        }

        closeAllPopups();
        buildOptions();

        popup.classList.add('show');
        trigger.classList.add('open');
        _activePopup = popup;
        _activeTrigger = trigger;

        // Position
        const rect = trigger.getBoundingClientRect();
        const popupHeight = Math.min(300, select.options.length * 42 + 16);
        const spaceBelow = window.innerHeight - rect.bottom - 8;

        popup.style.width = Math.max(rect.width, 180) + 'px';
        popup.style.left = rect.left + 'px';
        popup.style.right = 'auto';

        // Prevent overflow right
        const pWidth = Math.max(rect.width, 180);
        if (rect.left + pWidth > window.innerWidth - 8) {
            popup.style.left = (window.innerWidth - pWidth - 8) + 'px';
        }

        if (spaceBelow >= popupHeight) {
            popup.style.top = (rect.bottom + 4) + 'px';
            popup.style.bottom = 'auto';
        } else {
            popup.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
            popup.style.top = 'auto';
        }
    }

    trigger.addEventListener('click', openPopup);
    trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPopup(e); }
        if (e.key === 'Escape') closeAllPopups();
    });

    // Sync when value set externally via JS
    try {
        const proto = HTMLSelectElement.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, 'value');
        if (desc) {
            Object.defineProperty(select, 'value', {
                get: function() { return desc.get.call(this); },
                set: function(v) {
                    desc.set.call(this, v);
                    updateTriggerText(trigger, this);
                },
                configurable: true
            });
        }
    } catch(e) {}

    // Watch for new options added dynamically (e.g. loading marcas)
    const mo = new MutationObserver(function() {
        updateTriggerText(trigger, select);
    });
    mo.observe(select, { childList: true });
}

// Call after dynamic content is added
function reinitCustomSelects() {
    initCustomSelects();
}
