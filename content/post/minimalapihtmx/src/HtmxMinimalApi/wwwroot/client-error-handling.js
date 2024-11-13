window.addEventListener("load", () => {
    htmx.on("htmx:responseError", (event) => {
        if (event.detail.xhr.status >= 400) {
            window.location = window.location.origin + "/statuscode/" + event.detail.xhr.status;
        }
    });
});