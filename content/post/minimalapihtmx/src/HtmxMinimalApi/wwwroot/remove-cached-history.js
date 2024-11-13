// This script, along with the htmx-config refreshOnHistoryMiss key, makes sure that navigating backwards triggers a full page refresh rather than making an AJAX call.
// This is important in order to maintain query parameters are sent correctly to the minimal api endpoints.
window.addEventListener("load", () => {
    document.body.addEventListener('htmx:pushedIntoHistory', () => {
        localStorage.removeItem('htmx-history-cache')
    })
});