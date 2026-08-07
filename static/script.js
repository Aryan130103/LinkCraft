//bg video playback speed control
document.getElementById('bg-video').playbackRate = 0.6;

// Toggle-to-reveal behavior for optional fields
if (!('ontouchstart' in window)) {
    document.body.classList.add('has-hover');
}

document.querySelectorAll('.toggle-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const target = button.getAttribute('data-target');
        const field = document.getElementById('field-' + target);

        field.classList.toggle('hidden');
        
        if (field.classList.contains('hidden')) {
            button.classList.remove('active');
        } else {
            button.classList.add('active');
        }
    });
});

// Form submission
document.getElementById('shorten-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    const response = await fetch('/shorten', {
        method: 'POST',
        body: formData
    });

    if (response.status === 429) {
    document.getElementById('result-link').textContent = "Too many requests. Please wait a minute and try again.";
    document.getElementById('result-container').style.display = 'flex';
    document.getElementById('result-container').classList.add('error');
    document.getElementById('copy-btn').disabled = true;
    return;
    }

    if (!response.ok) {
        const errorText = await response.text();
        document.getElementById('result-link').textContent = errorText;
        document.getElementById('result-container').style.display = 'flex';
        document.getElementById('result-container').classList.add('error');
        document.getElementById('copy-btn').disabled = true;
        return;
    }

    const text = await response.text();
    const link = text.replace('Short link: ', '');

    document.getElementById('result-link').textContent = link;
    document.getElementById('result-container').style.display = 'flex';
    document.getElementById('result-container').classList.remove('error');
    document.getElementById('copy-btn').disabled = false;

    loadStats();
});

// Copy button
document.getElementById('copy-btn').addEventListener('click', function() {
    const link = document.getElementById('result-link').textContent;
    navigator.clipboard.writeText(link);
});

// Paste button
document.getElementById('paste-btn').addEventListener('click', async function() {
    const text = await navigator.clipboard.readText();
    document.getElementById('url-field').value = text;
});

document.getElementById('url-field').addEventListener('input', function() {
    document.getElementById('result-container').style.display = 'none';
});

//Stats bar update
async function loadStats() {
    const response = await fetch('/stats');
    const data = await response.json();

    document.getElementById('links-count').textContent = data.links_created;
    document.getElementById('avg-response').textContent = data.avg_response_ms + 'ms';
}

//media query for mobile responsiveness
function updateLayoutForScreenSize() {
    const statsBar = document.getElementById('stats-bar');
    if (window.innerWidth <= 600) {
        statsBar.style.position = 'static';
        statsBar.style.margin = '20px auto 0';
        statsBar.style.top = 'auto';
        statsBar.style.left = 'auto';
    } else {
        statsBar.style.position = 'fixed';
        statsBar.style.top = '20px';
        statsBar.style.left = '20px';
        statsBar.style.margin = '0';
    }
}

updateLayoutForScreenSize();
window.addEventListener('resize', updateLayoutForScreenSize);

loadStats();

