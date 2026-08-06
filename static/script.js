//bg video playback speed control
document.getElementById('bg-video').playbackRate = 0.6;

// Toggle-to-reveal behavior for optional fields
document.querySelectorAll('.toggle-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const target = button.getAttribute('data-target');
        const field = document.getElementById('field-' + target);

        field.classList.toggle('hidden');
        button.classList.toggle('active');
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

//Stats bar update
async function loadStats() {
    const response = await fetch('/stats');
    const data = await response.json();

    document.getElementById('links-count').textContent = data.links_created;
    document.getElementById('avg-response').textContent = data.avg_response_ms + 'ms';
}

loadStats();