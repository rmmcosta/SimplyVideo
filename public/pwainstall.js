import '@pwabuilder/pwainstall';
window.onload = () => {
    if (getInstalledStatus()) {
        const pwaInstallElem = document.getElementById('pwaInstall');
        pwaInstallElem.parentElement.removeChild(pwaInstallElem);
    }
}