import React, { Component } from 'react';
import Toolbar from './tools/toolbar';
import LevelSelect from './tools/levelSelect';
import Levels from './levels/levels';
import Vector from './shapes/vector';
import Line from './shapes/line';
import Mirror from './shapes/mirror'

export default class CanvasComponent extends Component {
    state = {
        points: {
            array: [],
            size: 0,
        },
        mirrors: [],
        isDrawing: false,
        isMoving: false,
        maxMirrors: 5,
        // completionImages: [],
    }
    completionImages = [];
    Levels = Levels;
    componentDidMount() {
        this.context = this.refs.canvas.getContext('2d');
        this.rect = this.refs.canvas.getBoundingClientRect();
        this.updateCanvas();
    }
    clearCanvas = () => {
        const context = this.refs.canvas.getContext('2d');
        context.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    }
    drawPrism = (prism) => {
        prism.lines.forEach((line) => this.drawLine(line));
    }

    drawCollector = (collector) => {
        const context = this.refs.canvas.getContext('2d');
        context.beginPath();
        context.strokeStyle = '#00FF00';
        context.fillStyle = '#00FF00';
        context.arc(collector.circle.center.x, collector.circle.center.y, collector.circle.radius,
            0, 2 * Math.PI);
        if (collector.success) {
            context.fill();
        } else {
            context.stroke();
        }
    }

    drawRectangle = (rect) => {
        console.log("rect");
        console.log(rect);
        const context = this.refs.canvas.getContext('2d');
        context.fillStyle = '#FF0000';
        context.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    drawLine = (line) => {
        console.log("line");
        console.log(line);
        const context = this.refs.canvas.getContext('2d');
        context.beginPath();
        context.moveTo(line.start.x, line.start.y);
        context.lineTo(line.end.x, line.end.y);
        context.lineWidth = line.width;
        context.strokeStyle = line.color;
        context.stroke();
    }
    drawPath = (points) => {
        const context = this.refs.canvas.getContext('2d');
        this.clearCanvas()
        points.array.forEach((value, index) => {
            if (index % 2 === 0) {
                context.beginPath()
                context.lineCap = 'round'
                context.moveTo(value.x, value.y)
            }
            else {
                context.lineTo(value.x, value.y)
                context.lineWidth = value.w
                context.strokeStyle = '#ffffff'
                context.stroke()
            }
        });
    }

    drawTool(tool) {
        switch (tool.constructor.name) {
            case 'Blocker':
                this.drawRectangle(tool.rectangle);
                break;
            case 'Mirror':
                this.drawLine(tool.line);
                break;
            case 'Prism':
                this.drawPrism(tool);
                break;
        }
    }

    onMouseMove(e) {
        if (this.state.isDrawing && (this.props.stage.tools.length + 1 <= this.state.maxMirrors)) {
            this.isMoving = true;
            this.state.points.array[this.state.points.size] = {
                x: e.clientX - this.rect.left,
                y: e.clientY - this.rect.top,
                w: 3,
            };
            this.drawPath(this.state.points);
        };
    }
    onMouseDown(e) {
        if (e.key == 'Shift') {
        } else {
            this.state.isDrawing = true;
            this.state.points.array.push({
                x: e.clientX - this.rect.left,
                y: e.clientY - this.rect.top
            });
            this.state.points['size'] = this.state.points['array'].length
            this.state.isDrawing = true

            this.startX = e.clientX - this.rect.x
            this.startY = e.clientY - this.rect.y;
        }
    }
    onMouseUp(e) {
        this.state.isDrawing = false;
        if (this.state.isMoving) {
            this.state.isMoving = false;
        }
        else {
            this.state.points['array'].pop()
        }
        this.state.points.array.pop();
        this.endX = e.clientX - this.rect.x;
        this.endY = e.clientY - this.rect.y;
        this.placeTool();
    }
    onTouchMove(e) {
        if (this.state.isDrawing && (this.props.stage.tools.length + 1 <= this.state.maxMirrors)) {
            this.isMoving = true;
            this.state.points.array[this.state.points.size] = {
                x: e.touches[0].clientX - this.rect.left,
                y: e.touches[0].clientY - this.rect.top,
                w: 3,
            };
            this.drawPath(this.state.points);
        };
    }
    onTouchStart(e) {
        this.state.isDrawing = true;
        this.state.points.array.push({
            x: e.touches[0].clientX - this.rect.left,
            y: e.touches[0].clientY - this.rect.top
        });
        this.state.points['size'] = this.state.points['array'].length
        this.state.isDrawing = true

        this.startX = e.touches[0].clientX - this.rect.x
        this.startY = e.touches[0].clientY - this.rect.y;
    }
    onTouchEnd(e) {
        this.state.isDrawing = false;
        if (this.state.isMoving) {
            this.state.isMoving = false;
        }
        else {
            this.state.points['array'].pop()
        }
        this.state.points.array.pop();
        this.endX = e.changedTouches[0].clientX - this.rect.x;
        this.endY = e.changedTouches[0].clientY - this.rect.y;
        this.placeTool();
    }
    placeTool = (e) => {
        if (this.props.stage.tools.length + 1 <= this.state.maxMirrors) {
            this.props.stage.add(new Mirror(new Line(new Vector(this.startX, this.startY), new Vector(this.endX, this.endY), '#0088FF', 3)));
            this.setState({ key: Math.random() });
        } else {
        }
    }
    updateCanvas = () => {
        console.log("blockers");
        console.log(this.props.stage.blockers);
        console.log("fixed tools");
        console.log(this.props.stage.fixedTools);
        console.log("mirrors");
        console.log(this.props.stage.tools);
        this.props.stage.blockers.forEach((blocker) => this.drawTool(blocker));
        this.props.stage.fixedTools.forEach((tool) => this.drawTool(tool));
        this.props.stage.tools.forEach((currentTool) => this.drawTool(currentTool));
        this.props.stage.lines.forEach((currentLine) => this.drawLine(currentLine));
        this.props.stage.collectors.forEach((collector) => this.drawCollector(collector));
        if (this.props.stage.level.completed) {
            this.props.stage.level.completed = false;
            this.completionImages.push(this.refs.canvas.toDataURL('image/png'));
            // this.props.levelComplete();
            // this.clearCanvas();
            // this.setState({ key: Math.random() });
        }
    }
    removeTools = () => {
        this.props.stage.removeAll();
        this.setState({ key: Math.random() });
    }
    undoTool = () => {
        this.props.stage.undo();
        this.clearCanvas()
        this.updateCanvas();
    }
    loadLevel = (level) => {
        this.props.stage.initialize(this.Levels[level]);
        this.clearCanvas()
        this.updateCanvas();
    }
    componentDidUpdate = () => {
        this.updateCanvas();
    }
    render() {
        return (
            <div>
                <LevelSelect levels={Levels} loadLevel={(level) => this.loadLevel(level)} />
                <canvas
                    key={this.state.key}
                    onClick={this.placeTool}
                    onMouseMove={(e) => this.onMouseMove(e)}
                    onMouseDown={(e) => this.onMouseDown(e)}
                    onMouseUp={(e) => this.onMouseUp(e)}
                    onTouchMove={(e) => this.onTouchMove(e)}
                    onTouchStart={(e) => this.onTouchStart(e)}
                    onTouchEnd={(e) => this.onTouchEnd(e)}
                    ref="canvas"
                    width={this.props.stage.width}
                    height={this.props.stage.height}
                    style={{ backgroundColor: "#000" }}
                />
                <Toolbar undoTool={this.undoTool} changeSelectedTool={this.changeSelectedToolIndex} removeTools={this.removeTools} completionImages={this.completionImages} />
            </div>
        );
    }
}