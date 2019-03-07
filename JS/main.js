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
function makeCircle(x, y, radius, options = 0) {
    return Bodies.circle(x, y, radius, options)
}

function makeRect(middleX, middleY, width, height, options = 0) {
    return Bodies.rectangle(middleX, middleY, width, height, options)
}

function draw(element) {
    World.add(world, element)
}

function wallTop(width, height = 0) {
    return makeRect(width / 2, 0, width, 50, {isStatic: true});
}

function wallBot(width, height) {
    return makeRect(width / 2, height, width, 50, {isStatic: true});
}

function wallLeft(width, height) {
    return makeRect(0, height / 2, 50, height, {isStatic: true});
}

function wallRight(width, height) {
    return makeRect(width, height / 2, 50, height, {isStatic: true});
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
        let ele = makeCircle(400, 250, 25, {restitution: 0.9, render: {fillStyle: '#b6f27d'}});
        Body.scale(ele, 1, 1);
        draw(ele);
    });

    col[1].addEventListener('click', () => {
        let ele = makeCircle(400, 250, 25, {restitution: 0.9, render: {fillStyle: '#f24'}});
        Body.scale(ele, 2, 2);
        draw(ele);
    });

    col[2].addEventListener('click', () => {
        let ele = makeCircle(400, 250, 25, {restitution: 0.9, render: {fillStyle: '#f2f'}});
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

        let ele = makeCircle(x, y, 25, {restitution: 0.9, render: {fillStyle: '#b6f27d'}});
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
        }
    });

    Render.run(render);

    let runner = Runner.create();
    Runner.run(runner, engine);

    walls(800, 600);

    let collider = Bodies.rectangle(200, 300, 350, 550, {
        isSensor: true,
        isStatic: true,
        render: {
            strokeStyle: '#C44D58',
            fillStyle: 'transparent',
            lineWidth: 1
        }
    });

    draw(collider);

    let ball = makeCircle(600, 500, 40, {
        restitution: 0.5,
        render: {strokeStyle: '#C7F464', fillStyle: 'transparent', lineWidth: 1}
    });
    draw([ball]);

    Events.on(engine, 'collisionStart', (e) => {
        let pairs = e.pairs;

        for (let i = 0, j = pairs.length; i !== j; i++) {
            let pair = pairs[i];

            if (pair.bodyA === collider) {
                pair.bodyB.render.strokeStyle = '#C44D58';
            } else if (pair.bodyB === collider) {
                pair.bodyA.render.strokeStyle = '#C44D58';
            }
        }
    });

    Events.on(engine, 'afterUpdate', () => {
        let collision = SAT.collides(collider, ball);

        if (collision.collided) {
            earth.addEventListener('click', () => {
                world.gravity.y = 1.5;
            });

            jupiter.addEventListener('click', () => {
                world.gravity.y = 5;
            });

            space.addEventListener('click', () => {
                world.gravity.y = 0;
            });
            console.log(world.gravity.y)
        }
    });

    Events.on(engine, 'collisionEnd', function (event) {
        let pairs = event.pairs;

        for (let i = 0, j = pairs.length; i !== j; ++i) {
            let pair = pairs[i];

            if (pair.bodyA === collider) {
                pair.bodyB.render.strokeStyle = '#C7F464';
            } else if (pair.bodyB === collider) {
                pair.bodyA.render.strokeStyle = '#C7F464';
            }
        }
    });

    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
            stiffness: 0.2,
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