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


//== Friction -->
project.friction = function () {

    let render = Render.create({
        element: mid,
        engine,
        options: {
            width: 800,
            height: 600,
            wireframeBackground: '#333',
            wireframes: true,
            showVelocity: true,
            showAngleIndicator: false,
            showCollisions: true,
        }
    });

    Render.run(render);

    //== Runner create
    let runner = Runner.create();
    Runner.run(runner, engine);
    //== All 4 walls
    // walls(800, 600);

    let leftWall = wallLeft(800, 600);
    let rightWall = wallRight(800, 600);
    draw([leftWall, rightWall]);

    //== Static slides
    let slide1 = makeRect(300, 100, 800, 20, {angle: Math.PI * 0.05, isStatic: true});
    let slide2 = makeRect(500, 300, 800, 20, {angle: -Math.PI * 0.05, isStatic: true});
    let slide3 = makeRect(300, 500, 800, 20, {angle: Math.PI * 0.05, isStatic: true});
    draw([slide1, slide2, slide3]);

    let box = makeRect(400, 50, 50, 50, {friction: 0.00001});
    draw(box);

    let collision = SAT.collides(box, slide1);

    Events.on(engine, 'afterUpdate', () => {
        if (box.position.y > 600) {
            Body.translate(box, {
                x: -400,
                y: -600
            })
        }
    });


    //== Mouse control
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

    //== Mouse in sync with rendering
    render.mouse = mouse;

    //== Fit the render in viewport
    Render.lookAt(render, {
        min: {x: 0, y: 0},
        max: {x: 800, y: 600},
    });

    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

project.friction();