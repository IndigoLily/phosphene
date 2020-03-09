const cnv = document.body.appendChild(document.createElement('canvas'));
const c = cnv.getContext('2d');

const TAU = Math.PI*2;
let circles = [];

let w = cnv.width = innerWidth;
let h = cnv.height = innerHeight;

window.addEventListener('resize', e => {
    for (let i = 0, len = circles.length; i < len; ++i) {
        const it = circles[i];
        it.x = it.x / w * innerWidth;
        it.y = it.y / h * innerHeight;
        it.r = it.r / Math.hypot(w,h) * Math.hypot(innerWidth, innerHeight);
    }

    w = cnv.width = innerWidth;
    h = cnv.height = innerHeight;
});

let count = 0;
draw();

function draw() {
    if (count++ > 5) {
        count = 0;
        circles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.5,
            clr: Math.random() < 0.5 ? '#fff' : '#000',
        });
    }

    for (let i = 0, len = circles.length; i < len; ++i) {
        const it = circles[i];
        it.r *= 1.01;
        c.fillStyle = it.clr
        c.beginPath();
        c.arc(it.x, it.y, it.r, 0, TAU);
        c.fill();
    }

    circles = circles.filter(circle => circle.r * circle.r < w*w + h*h);

    requestAnimationFrame(draw);
}
