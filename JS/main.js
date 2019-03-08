let project = {};

const Engine = Matter.Engine;
const Events = Matter.Events;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Composites = Matter.Composites;
const Composite = Matter.Composite;
const Common = Matter.Common;
const Constraint = Matter.Constraint;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const SAT = Matter.SAT;
const Bounds = Matter.Bounds;

//== Engine creation
let engine = Engine.create();
let world = engine.world;

let col = document.querySelectorAll('.col');

//== Functions
function createCircle(x, y, radius, options = 0) {
    return Bodies.circle(x, y, radius, options)
}

function createRect(middleX, middleY, width, height, options = 0) {
    return Bodies.rectangle(middleX, middleY, width, height, options)
}

function draw(element) {
    World.add(world, element)
}

function wallTop(width, height = 0) {
    return createRect(width / 2, -20, width, 50, {isStatic: true, render: {fillStyle: '#333', restitution: 0}});
}

function wallBot(width, height) {
    return createRect(width / 2, height + 20, width, 50, {isStatic: true, render: {fillStyle: '#333', restitution: 0}});
}

function wallLeft(width, height) {
    return createRect(-20, height / 2, 50, height, {isStatic: true, render: {fillStyle: '#333', restitution: 0}});
}

function wallRight(width, height) {
    return createRect(width + 20, height / 2, 50, height, {isStatic: true, render: {fillStyle: '#333', restitution: 0}});
}

function walls(width, height) {
    return draw([wallTop(width, height), wallBot(width, height), wallLeft(width, height), wallRight(width, height)]);
}

const mid = document.getElementById('middle');


//== Restitution
project.restitution = function () {

    let render = Render.create({
        element: mid,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframeBackground: '#333',
            wireframes: true,
            showVelocity: true,
            showAngleIndicator: false,
            showCollisions: false,
        }
    });

    Render.run(render);

    let runner = Runner.create();
    Runner.run(runner, engine);

    walls(render.options.width, render.options.height);

    let topWall = wallTop(render.options.width, render.options.height);

    draw([topWall,]);

    col[0].addEventListener('click', () => {
        let ele = createCircle(400, 250, 25, {restitution: 0.9, render: {fillStyle: '#b6f27d'}});
        Body.scale(ele, 1, 1);
        draw(ele);
    });

    col[1].addEventListener('click', () => {
        let ele = createCircle(400, 250, 25, {restitution: 0.9, render: {fillStyle: '#f24'}});
        Body.scale(ele, 2, 2);
        draw(ele);
    });

    col[2].addEventListener('click', () => {
        let ele = createCircle(400, 250, 25, {restitution: 0.9, render: {fillStyle: '#f2f'}});
        Body.scale(ele, 3, 3);
        draw(ele);
    });

    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            angularStiffness: 0.1,
            render: {
                visible: false
            },
        },
    });

    World.add(world, mouseConstraint);
    render.mouse = mouse;

    Render.lookAt(render, {
        min: {x: 0, y: 0},
        max: {x: 800, y: 600},
    });

    Events.on(mouseConstraint, 'enddrag', (e) => {
        let collision = SAT.collides(topWall, e.body);

        if (collision.collided) {
            let c = Constraint.create({
                pointA: {x: e.body.position.x, y: 25},
                bodyB: e.body,
                pointB: {x: 0, y: -e.body.circleRadius},
                stiffness: 0.0005,
            });
            draw(c);
        }
    });

    function drag(e) {
        e.target.style.borderRadius = "50%";
        e.target.style.opacity = "1";
    }

    function drop(e) {
        e.preventDefault();
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left; //x position within the element.
        let y = e.clientY;  //y position within the element.

        let ele = createCircle(x, y, 25, {restitution: 0.9, render: {fillStyle: '#b6f27d'}});
        Body.scale(ele, 1, 1);
        draw(ele);
    }

    document.getElementById('middle').addEventListener('drop', drop);
    document.addEventListener('dragstart', drag);
    document.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    return {
        engine,
        runner,
        render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    }
};

//== FREEFALL --------------------------------------------------------------------------------->
const earth = document.getElementById('earth');
const jupiter = document.getElementById('jupiter');
const space = document.getElementById('space');

const clear = document.getElementById('clearWorld');

project.freeFall = function () {

    let render = Render.create({
        element: mid,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframeBackground: '#333',
            wireframes: false,
            showVelocity: true,
            showCollisions: false,
            background: 'img/pokus-fizika.png'
        }
    });

    Render.run(render);

    let runner = Runner.create();
    Runner.run(runner, engine);

    walls(800, 600);

    let jupiter = createRect(85, 300, 160, 590, {
        restitution: 0,
        isSensor: true,
        isStatic: true,
        render: {strokeStyle: '#C44D58', fillStyle: 'transparent', lineWidth: 1}
    });

    let saturn = createRect(245, 300, 160, 590, {
        restitution: 0,
        isSensor: true,
        isStatic: true,
        render: {strokeStyle: '#C44D58', fillStyle: 'transparent', lineWidth: 1}
    });

    let earth = createRect(405, 300, 160, 590, {
        restitution: 0,
        isSensor: true,
        isStatic: true,
        render: {strokeStyle: '#C44D58', fillStyle: 'transparent', lineWidth: 1}
    });

    let moon = createRect(565, 300, 160, 590, {
        restitution: 0,
        isSensor: true,
        isStatic: true,
        render: {strokeStyle: '#C44D58', fillStyle: 'transparent', lineWidth: 1}
    });

    let space = createRect(725, 300, 160, 590, {
        restitution: 0,
        isSensor: true,
        isStatic: true,
        render: {strokeStyle: '#C44D58', fillStyle: 'transparent', lineWidth: 1}
    });

    draw([jupiter, saturn, earth, moon, space]);

    let ball = createCircle(410, 100, 40, {
        restitution: 0.9,
        render: {strokeStyle: '#C7F464', fillStyle: 'transparent', lineWidth: 1}
    });
    draw([ball]);

    Events.on(engine, 'afterUpdate', _.throttle(() => {
            let jupColl = SAT.collides(jupiter, ball).collided;
            let satColl = SAT.collides(saturn, ball).collided;
            let earColl = SAT.collides(earth, ball).collided;
            let mooColl = SAT.collides(moon, ball).collided;
            let spaColl = SAT.collides(space, ball).collided;

            if (jupColl) {
                world.gravity.y = 2.53;
                ball.restitution = 0.4;
            }

            if (satColl) {
                world.gravity.y = 1.07;
                ball.restitution = 0.9;
            }

            if (earColl) {
                world.gravity.y = 1;
                ball.restitution = 0.9;
            }

            if (mooColl) {
                world.gravity.y = 0.17;
                ball.restitution = 1;
            }

            if (spaColl) {
                world.gravity.y = 0;
                ball.restitution = 0;
            }
        }, 400)
    );


    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
            stiffness: 0.2,
            // angularStiffness: 0,
            render: {
                visible: false,
            }
        }
    });

    draw(mouseConstraint);
    render.mouse = mouse;

    Render.lookAt(render, {
        min: {x: 0, y: 0},
        max: {x: 800, y: 600},
    });

    return {
        engine,
        runner,
        render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    }
};

// project.restitution();
project.freeFall();