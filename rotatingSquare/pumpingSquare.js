/**
 * @file
 *
 * Summary.
 *
 * Vertices are scaled by an amount that varies by
 * frame, and this value is passed to the draw function.
 *
 * @author Paulo Roma
 * @since 17/08/2022
 * @see https://orion.lcg.ufrj.br/cs336/examples/example123/content/GL_example3a.html
 */

"use strict";

/**
 * Raw data for some point positions -
 * this will be a square, consisting of two triangles.
 * <p>We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).</p>
 * @type {Float32Array}
 */
var vertices = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

var posicoes = [];



/**
 * Number of points (vertices).
 * @type {Number}
 */
var numPoints = vertices.length / 2;

// A few global variables...

/**
 * Canvas width.
 * @type {Number}
 */
var w;

/**
 * Canvas height.
 * @type {Number}
 */
var h;
var sentido = true;
var angle = 0.034;
var angleTotal = 0;
var increment = 0.03;
var centro;
/**
 * Maps a point in world coordinates to viewport coordinates.<br>
 * - [-n,n] x [-n,n] -> [-w,w] x [h,-h]
 * <p>Note that the Y axix points downwards.</p>
 * @param {Number} x point x coordinate.
 * @param {Number} y point y coordinate.
 * @param {Number} n window size.
 * @returns {Array<Number>} transformed point.
 */
function mapToViewport(x, y, n = 5) {
    return [((x + n / 2) * w) / n, ((-y + n / 2) * h) / n];
}

function setPosicao(x, y, i) {
    let j = (i % numPoints) * 2;
    posicoes[j] = x;
    posicoes[j + 1] = y;
}

function getPosicao(i) {
    let j = (i % numPoints) * 2;
    return [posicoes[j], posicoes[j + 1]];
}


/**
 * Returns the coordinates of the vertex at index i.
 * @param {Number} i vertex index.
 * @returns {Array<Number>} vertex coordinates.
 */
function getVertex(i) {
    let j = (i % numPoints) * 2;
    return [vertices[j], vertices[j + 1]];
}

function rodar(x, y, angle, center) {
    let xf;
    let yf;
    x -= center[0]
    y -= center[1]
    xf = Math.cos(angle) * x - Math.sin(angle) * y;//Transformação linear de rotação horária
    yf = Math.sin(angle) * x + Math.cos(angle) * y;
    xf += center[0];
    yf += center[1];
    return [xf, yf];
}

/**
 * Code to actually render our geometry.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} scale scale factor.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */

document.addEventListener('keydown', (event) => {
    var name = event.key;
    switch (name) {
        case ("a"):
            angle = -angle;
            break;
        case ("r"):
            centro = getPosicao(5);
            break;
        case ("g"):
            centro = getPosicao(2);
            break;
        case ("b"):
            centro = getPosicao(1);
            break;
        case ("w"):
            centro = getPosicao(0);
            break;
    }
}, false);

function draw(ctx, angle, center) {
    ctx.fillStyle = "rgba(0, 204, 204, 1)";
    ctx.rect(0, 0, w, h);
    let cores = ["green", "blue", "white", "red"];
    ctx.fill();
    angleTotal += angle;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        if (i == 3 || i == 4) continue;
        let [x, y] = getPosicao(i)
        let xf = rodar(x, y, angle,centro)[0];
        let yf = rodar(x, y, angle,centro)[1];
        setPosicao(xf, yf, i);
        if (i == 0) ctx.moveTo(xf, yf);
        else ctx.lineTo(xf, yf);
    }
    ctx.closePath();

    // the fill color
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    for (let j = 0; j < numPoints; j++) {
        if (j == 3 || j == 4) continue;
        let [x, y] = getPosicao(j)
        let xf = rodar(x, y, angle,centro)[0];
        let yf = rodar(x, y, angle,centro)[1];
        ctx.moveTo(xf, yf);
        let cent = [xf,yf];
        [x,y]=rodar(xf+10,yf,angleTotal,cent);
        ctx.lineTo(x,y);
        [x,y]=rodar(xf+10,yf+10,angleTotal,cent);
        ctx.lineTo(x,y);
        [x,y]=rodar(xf,yf+10,angleTotal,cent);
        ctx.lineTo(x,y);
        ctx.fillStyle = cores[j];
        ctx.fill();
    }



    ctx.closePath();
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.
 */
function mainEntrance() {
    // retrieve <canvas> element
    var canvasElement = document.querySelector("#theCanvas");
    var ctx = canvasElement.getContext("2d");

    w = canvasElement.width;
    h = canvasElement.height;
    centro = mapToViewport(...getVertex(5));
    for (let i = 0; i < numPoints; i++) {
        let [x, y] = mapToViewport(...getVertex(i));
        setPosicao(x, y, i);
    }
    /**
  * A closure to set up an animation loop in which the
  * scale grows by "increment" each frame.
  * @global
  * @function
  */
    var runanimation = (() => {
        //var scale = 1.0;

        return () => {
            draw(ctx, angle, centro);
            //scale += increment;
            // if (sentido) {
            //     angle += increment;
            // } else {
            //     angle -= increment;
            // }

            // request that the browser calls runanimation() again "as soon as it can"
            requestAnimationFrame(runanimation);
        };
    })();

    // draw!
    runanimation();
}
