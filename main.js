const BLACK = "#000000FF";
const WHITE = "#FFFFFFFF";
const TAU = Math.PI*2;

const cnv = document.body.appendChild(document.createElement('canvas'));
const c = cnv.getContext('2d', { alpha: false });

let circles = [];
let w, h, diag, frameId;

function dist(x1, y1, x2, y2) {
    return Math.hypot(x1-x2, y1-y2);
}

class Circle {//{{{
    furthestCornerDist;

    constructor() {
        this.r = 0.5;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.clr = Math.random() < 0.5 ? WHITE : BLACK;
        this.furthestCornerDist = this.getFurthestCornerDist();
        this.isDead = false;
    }

    getFurthestCornerDist() {
        const dists = [
            [0,0],
            [w,0],
            [w,h],
            [0,h],
        ].map(crnr => dist(this.x, this.y, ...crnr));
        return Math.max(...dists);
    }

    refit(oldw, oldh) {
        this.x = this.x / oldw * w;
        this.y = this.y / oldh * h;
        this.r = this.r / Math.hypot(oldw,oldh) * diag;
        this.furthestCornerDist = this.getFurthestCornerDist();
    }

    contains(other) {
        if (this.r < other.r) return false; // can't contain a bigger circle
        if (Math.abs(this.x - other.x) > this.r + other.r) return false;
        if (Math.abs(this.y - other.y) > this.r + other.r) return false;
        return dist(this.x, this.y, other.x, other.y) + other.r <= this.r;
    }

    draw() {
        this.r *= 1.01;
        if (this.r > this.furthestCornerDist) {
            this.isDead = true;
        }
        c.fillStyle = this.clr;
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, TAU);
        c.fill();
    }
}//}}}

function resize() {//{{{
    cancelAnimationFrame(frameId);
    const [oldw, oldh] = [w, h];

    w = cnv.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) + 1;
    h = cnv.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) + 1;
    diag = Math.hypot(w,h);

    for (const circle of circles) {
        circle.refit(oldw, oldh);
    }

    frameId = requestAnimationFrame(draw);
}//}}}

window.onload = resize;

window.addEventListener('resize', resize);

/* debug stuff {{{
let perf = document.createElement("div");
document.body.appendChild(perf);
perf.style.position = 'fixed';
perf.style.left = '0.5ch';
perf.style.top = '0.2ch';
perf.style.color = '#f00';
perf.style.fontSize = '100px';
perf.innerText = 'testing';

let sat = false;

const fpssMaxLen = 256;
let fpss = [];
let lt = performance.now();
}}}*/

let frameNumber = 0n;
function draw(t) {//{{{
    frameNumber += 1n;

    /* debug stuff {{{
    const dt = (t - lt) || 0;
    lt = t;

    if (sat) {
        fpss.push(1000 / dt);
        if (fpss.length > fpssMaxLen) {
            fpss.shift();
        }

        if (fpss.length === fpssMaxLen) {
            const fps = fpss.reduce((acc,curr) => acc + curr) / fpss.length;
            perf.innerText = Math.floor(fps * 100) / 100 + '\n' + circles.length;
        } else {
            perf.innerText = ((fpss.length / fpssMaxLen * 100) | 0) + '%';
        }
    }
    }}}*/

    if (frameNumber % 5n == 0n) {
        circles.push(new Circle());
    }

    let lastClr = circles[0]?.clr;
    c.fillStyle = lastClr;
    drawloop:
    for (let i = 0; i < circles.length; i++) {
        const ci = circles[i];
        ci.r *= 1.01;

        if (ci.r > ci.furthestCornerDist) {
            ci.isDead = true;
            sat = true;
            continue drawloop;
        }

        /* thought this might speed it up, but it didn't
         *
         * for (let j = i + 1; j < circles.length; j++) {
         *     const cj = circles[j];
         *     if (cj.contains(ci)) {
         *         ci.isDead = true;
         *         continue drawloop;
         *     }
         * }
         */

        if (lastClr !== ci.clr) {
            c.fill();
            lastClr = ci.clr;
            c.fillStyle = lastClr;
        }

        c.beginPath();
        c.arc(ci.x, ci.y, ci.r, 0, TAU);
    }
    c.fill();

    circles = circles.filter(circle => !circle.isDead);

    frameId = requestAnimationFrame(draw);
}//}}}
