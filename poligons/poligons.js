let glmatrix = import('https://unpkg.com/gl-matrix@3.3.0/esm/index.js?module');
let vec2 = Object.assign({}, glmatrix.vec2);
let mat3 = glmatrix.mat3;

//
// Orientation between 3 points
//
vec2.orient = function (a, b, c) {
    return Math.sign(
        mat3.determinant([1, a[0], a[1], 1, b[0], b[1], 1, c[0], c[1]])
    );
};

//
// Returns true iff line segments a-b and c-d intersect.
//
vec2.segmentsIntersect = function (a, b, c, d) {
    return vec2.orient(a, b, c) != vec2.orient(a, b, d) && vec2.orient(c, d, a) != vec2.orient(c, d, b)
}

//
// Line intersection. Sets 'out' to 
// the intersection point between lines [x1,y1]-[x2,y2] and [x3,y3]-[x4,y4].
//
vec2.lineIntersection = function (
    out,
    [x1, y1],
    [x2, y2],
    [x3, y3],
    [x4, y4]
) {
    const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const a = x1 * y2 - y1 * x2,
        b = x3 * y4 - y3 * x4;

    out[0] = (a * (x3 - x4) - (x1 - x2) * b) / D;
    out[1] = (a * (y3 - y4) - (y1 - y2) * b) / D;
    return out;
};

"use strict";

const iso = [
    [200, 300],
    [300, 200]
];

const update = (ctx) => {
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = ctx.strokeStyle = "black";
    for (let p of iso) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.beginPath();
    for (let p of isosceles(...iso)) {
        ctx.lineTo(...p);
    }
    ctx.closePath();
    ctx.stroke();
};
var w;

var h;
function mapToViewport(x, y, n = 5) {
    return [((x + n / 2) * w) / n, ((-y + n / 2) * h) / n];
}

function isosceles(basePoint, oppositeVertex) {
    const u = vec2.sub([], basePoint, oppositeVertex);
    const v = [-u[1], u[0]];
    const w = [u[1], -u[0]];
    return [
        oppositeVertex,
        vec2.add([], basePoint, v),
        vec2.add([], basePoint, w)
    ];
}

function draw(ctx) {
    ctx.fillStyle = "rgba(0, 204, 204, 1)";
    ctx.rect(0, 0, w, h);
    ctx.fill();
    ctx.beginPath();
    update(ctx);
    ctx.closePath();
}

let prevMouse = null;
const dragBase = (e) => {
    let mouse = [e.offsetX, e.offsetY];
    let [base, vtx] = iso;
    let v = vec2.sub([], vtx, base);
    let delta = vec2.sub([], mouse, prevMouse);
    prevMouse = mouse;
    vec2.add(base, base, delta);
    vec2.add(vtx, base, v);
};

const dragVtx = (e) => {
    let mouse = [e.offsetX, e.offsetY];
    let [base, vtx] = iso;
    let delta = vec2.sub([], mouse, prevMouse);
    prevMouse = mouse;
    vec2.add(vtx, vtx, delta);
};

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.
 */
var canvasElement = document.querySelector("#theCanvas");

canvasElement.onmousedown = (e) => {
    const mouse = [e.offsetX, e.offsetY];
    prevMouse = mouse;
    canvasElement.onmousemove = null;
    for (let i of [0, 1]) {
        let p = iso[i];
        let d = vec2.distance(mouse, p);
        if (d <= 5) {
            canvasElement.onmousemove =
                i == 0
                    ? (e) => {
                        dragBase(e);
                        update();
                    }
                    : (e) => {
                        dragVtx(e);
                        update();
                    };
        }
    }
};

canvasElement.onmouseup = () => {
    canvasElement.onmousemove = null;
};

function mainEntrance() {
    var ctx = canvasElement.getContext("2d");

    w = canvasElement.width;
    h = canvasElement.height;

    var runanimation = (() => {

        return () => {
            draw(ctx);
            requestAnimationFrame(runanimation);
        };
    })();

    runanimation();
}
