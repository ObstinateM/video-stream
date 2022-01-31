var controls = document.getElementById('controls');
var video = document.getElementById('video');
var timeout;
var duration = 1000;
video.addEventListener('mousemove', function () {
    controls.classList.add('show');
    video.classList.remove('hide-cursor');
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        controls.classList.remove('show');
        video.classList.add('hide-cursor');
    }, duration);
});
