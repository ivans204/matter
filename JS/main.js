let project = {};

let Engine = Matter.Engine;
let Events = Matter.Events;
let Render = Matter.Render;
let Runner = Matter.Runner;
let Composites = Matter.Composites;
let Common = Matter.Common;
let Constraint = Matter.Constraint;
let MouseConstraint = Matter.MouseConstraint;
let Mouse = Matter.Mouse;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let SAT = Matter.SAT;

let engine = Engine.create();
let world = engine.world;

let col = document.querySelectorAll('.col');

//== Funkcije
function makeCircle(x, y, r, options) {
    return Bodies.circle(x, y, r, options)
}

function draw(element) {
    World.add(world, element)
}

project.restitution = function () {

    let render = Render.create({
        element: document.querySelector('.middle'),
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframeBackground: '#333',
            wireframes: true,
            showVelocity: true,
            showAngleIndicator: false,
            background: '#333',
            showCollisions: false,
        }
    });

    Render.run(render);

    let runner = Runner.create();
    Runner.run(runner, engine);

    let wallTop = Bodies.rectangle(400, 0, 800, 50, {isStatic: true, mass: 1000});
    let wallBot = Bodies.rectangle(400, 600, 800, 50, {isStatic: true, mass: 1000});
    let wallLeft = Bodies.rectangle(0, 300, 50, 600, {isStatic: true, mass: 1000});
    let wallRight = Bodies.rectangle(800, 300, 50, 600, {isStatic: true, mass: 1000});

    //== zidovi
    draw([wallTop, wallBot, wallLeft, wallRight]);

    col[0].addEventListener('click', () => {
        let ele = makeCircle(400, 250, 25, {restitution: 0.9, render: {fillStyle: '#b6f27d'}});
        Body.scale(ele, 1, 1);
        draw(ele);
    });

    col[1].addEventListener('click', () => {
        let ele = makeCircle(400, 250, 25, {restitution: 0.6, render: {fillStyle: '#f24'}});
        Body.scale(ele, 2, 2);
        draw(ele);
    });

    col[2].addEventListener('click', () => {
        let ele = makeCircle(400, 250, 25, {restitution: 0.4, render: {fillStyle: '#f2f'}});
        Body.scale(ele, 3, 3);
        ele.mass = 1000;
        draw(ele);
    });

    let mouse = Mouse.create(render.canvas);
    let mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            length: 0,
            angularStiffness: 0,
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

    let wtf = false;

    Events.on(mouseConstraint, 'startdrag', (e) => {
        let bb = SAT.collides(wallTop, e.body).bodyB.id;
        Events.on(engine, 'collisionStart', () => {

            let c = Constraint.create({
                pointA: {x: e.body.position.x, y: 25},
                bodyB: e.body,
                stiffness: 0.001,
            });
            console.log(c, bb);
            if (bb !== c.bodyB.id) {
                draw([c]);
            }

            // if (!wtf) {
            //     wtf = true;
            //     let c = Constraint.create({
            //         pointA: {x: e.body.position.x, y: 25},
            //         bodyB: e.body,
            //         stiffness: 0.001,
            //     });
            //     draw([c]);
            // }
        })
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
    document.addEventListener("drag", function (e) {

    });
    document.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    document.addEventListener("dragend", function (e) {

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

project.restitution();