function updateImportElements() {
    const foundElements = document.querySelectorAll('div.import');

    foundElements.forEach(async importElement => {
        if (importElement.hasAttribute('data-path')) {
            const path = importElement.getAttribute('data-path');
            const request = await fetch(path, { cache: 'no-cache' });

            if (request.ok && request.headers.get('content-type') == "text/html") {
                const html = await request.text();
                const renderer = document.createElement('div');
                
                renderer.innerHTML = html;
                const children = Array.from(renderer.children);
                const parent = importElement.parentElement;

                children.forEach(child => {
                    if (parent) {   
                        parent.insertBefore(child, importElement);
                    }
                });

                importElement.remove();
            }

        }
    });
}


const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
        if (mutation.type == "childList") {
            updateImportElements();
        }
    })
});

observer.observe(document, {
    childList: true,
    subtree: true
});

updateImportElements();
