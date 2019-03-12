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
const Vertices = Matter.Vertices;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const SAT = Matter.SAT;
const Bounds = Matter.Bounds;
const Svg = Matter.Svg;

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

function createPolygon(x, y, sides, radius, options) {
    return Bodies.polygon(x, y, sides, radius, options)
}

function draw(element) {
    World.add(world, element)
}

function wallTop(width, height = 0) {
    return createRect(width / 2, -20, width, 50, {
        isStatic: true, restitution: 0, friction: 0, frictionAir: 0, render: {fillStyle: '#333'}
    });
}

function wallBot(width, height) {
    return createRect(width / 2, height + 20, width, 50, {
        isStatic: true, restitution: 0, friction: 0, frictionAir: 0, render: {fillStyle: '#333'}
    });
}

function wallLeft(width, height) {
    return createRect(-20, height / 2, 50, height, {
        isStatic: true, restitution: 0, friction: 0, frictionAir: 0, render: {fillStyle: '#333'}
    });
}

function wallRight(width, height) {
    return createRect(width + 20, height / 2, 50, height, {
        isStatic: true, restitution: 0, friction: 0, frictionAir: 0, render: {fillStyle: '#333'}
    });
}

function walls(width, height) {
    return draw([
        wallTop(width, height),
        wallBot(width, height),
        wallLeft(width, height),
        wallRight(width, height)
    ]);
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
        let ele = createCircle(400, 250, 25,
            {restitution: 0.9, render: {fillStyle: '#b6f27d'}}
        );
        Body.scale(ele, 1, 1);
        draw(ele);
    });

    col[1].addEventListener('click', () => {
        let ele = createCircle(400, 250, 25,
            {restitution: 0.9, render: {fillStyle: '#f24'}}
        );
        Body.scale(ele, 2, 2);
        draw(ele);
    });

    col[2].addEventListener('click', () => {
        let ele = createCircle(400, 250, 25,
            {restitution: 0.9, render: {fillStyle: '#f2f'}}
        );
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

    let planetOptions = {
        restitution: 0,
        friction: 0,
        frictionAir: 0,
        isStatic: true,
        render: {strokeStyle: '#C44D58', fillStyle: 'transparent', lineWidth: 1}
    };

    let planetPos = [
        {x: 160, y: 300, width: 2, height: 590, planetOptions},
        {x: 320, y: 300, width: 2, height: 590, planetOptions},
        {x: 480, y: 300, width: 2, height: 590, planetOptions},
        {x: 640, y: 300, width: 2, height: 590, planetOptions},
        {x: 800, y: 300, width: 2, height: 590, planetOptions},
    ];

    planetPos.forEach((v, k) => {
        draw(Bodies.rectangle(planetPos[k].x,
            planetPos[k].y, planetPos[k].width, planetPos[k].height, planetPos[k].planetOptions));
    });

    let ball = createCircle(410, 100, 40, {
        restitution: 0.9,
        frictionAir: 0,
        friction: 0,
        mass: 1,
        render: {strokeStyle: '#C7F464', fillStyle: 'transparent', lineWidth: 1},
    });

    draw([ball]);

    Events.on(engine, 'afterUpdate', _.throttle(() => {
            let ballPosX = ball.position.x;

            if (ballPosX >= 0 && ballPosX <= 160) {
                world.gravity.y = 2.53;
                ball.restitution = 0.4;
            }

            if (ballPosX > 160 && ballPosX <= 320) {
                world.gravity.y = 1.07;
                ball.restitution = 0.6;
            }

            if (ballPosX > 320 && ballPosX <= 480) {
                world.gravity.y = 1;
                ball.restitution = 0.7;
            }

            if (ballPosX > 480 && ballPosX <= 640) {
                world.gravity.y = 0.17;
                ball.restitution = 0.99;
            }

            if (ballPosX > 640 && ballPosX <= 800) {
                world.gravity.y = 0;
                ball.restitution = 1;
            }
        }, 400)
    );

    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
            stiffness: 0.2,
            angularStiffness: 1,
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


//== Horizontal Fall ----------------------------------------------------------->
project.horizontalFall = function () {
    let render = Render.create({
        element: mid,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframes: true,
            showVelocity: true,
            background: '#333'
        }
    });

    Render.run(render);

    let runner = Runner.create();
    Runner.run(runner, engine);

    let botWall = wallBot(800, 600);
    let rightWall = wallRight(800, 600);
    let leftWall = wallLeft(800, 600);
    draw([leftWall, botWall, rightWall]);

    let xOs = createRect(400, 270, 800, 1,
        {isStatic: true, collisionFilter: {mask: 0x0002}}
    );
    draw([xOs]);

    world.gravity.y = 1;

    let ball = createCircle(25, 265, 20,
        {mass: 20, frictionAir: 0, friction: 0}
    );

    let polica = createRect(50, 290, 60, 10, {isStatic: true});

    draw([ball, polica]);

    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
            stiffness: 0.2,
            angularStiffness: 1,
            render: {
                visible: false,
            }
        }
    });

    draw(mouseConstraint);
    render.mouse = mouse;

    let hor = document.getElementById('horizontal');
    let ver = document.getElementById('vertical');
    let range = document.getElementById('range');
    let rangeNum = document.getElementById('range-num');

    range.addEventListener('input', () => {
        rangeNum.innerText = range.value;
    });

    ver.addEventListener('click', () => {
        // console.log(parseInt(range.value) * (Math.PI / 180))
        let radian = parseInt(range.value) * (Math.PI / 180);
        Body.applyForce(ball, {x: ball.position.x, y: ball.position.y},
            {x: Math.cos(radian), y: -Math.sin(radian)}
        );
        console.log(ball.force);
    });

    Events.on(engine, 'afterUpdate', _.throttle(() => {
            // console.log(ball.velocity);

            let col = SAT.collides(ball, botWall).collided;
            if (ball.position.x >= 60 && mouseConstraint.mouse.button === -1 && !col) {
                let dot = createRect(ball.position.x, ball.position.y, 1, 1,
                    {isStatic: true, collisionFilter: {mask: 0x0002}, render: {fillStyle: '#fff'}});
                draw(dot);
            }
        }, 1)
    );


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
// project.freeFall();
project.horizontalFall();