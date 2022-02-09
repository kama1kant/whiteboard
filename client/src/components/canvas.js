import React, { Component } from 'react';
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLine: true,
            whiteBoardDB: [],
            isDrawStart: false,
            startPosition: { x: 0, y: 0 },
            lineCoordinates: { x: 0, y: 0 }
        }
    }

    componentDidMount() {
        this.initializeCanvas();

        var database = this.eventGet();
        database.then(db => {
            this.drawFromDb();
        }, reason => {
            console.error('Error! Unable to fetch DB');
        });
    }

    initializeCanvas = () => {
        const canvasEle = document.getElementById('canvas');
        canvasEle.addEventListener('mousedown', this.mouseDownListener);
        canvasEle.addEventListener('mousemove', this.mouseMoveListener);
        canvasEle.addEventListener('mouseup', this.mouseupListener);
        canvasEle.addEventListener('touchstart', this.mouseDownListener);
        canvasEle.addEventListener('touchmove', this.mouseMoveListener);
        canvasEle.addEventListener('touchend', this.mouseupListener);
    }

    eventGet = async () => {
        var response = await Axios.get('http://localhost:3001/getProject');
        if ('data' in response) {
            this.setState({ whiteBoardDB: response.data });
            return this.state.whiteBoardDB;
        }
    }

    eventSave = async () => {
        var params = { 'data': this.state.whiteBoardDB };
        var response = await Axios.post('http://localhost:3001/saveProject', params);
    }

    eventClear = async () => {
        await this.setAsyncState({ whiteBoardDB: [] });
        await this.eventSave();
        this.clearCanvas();
    }

    eventDropdown = (e) => {
        if (e.target.value == 'line'){
            this.setState({ isLine: true });
        } else{
            this.setState({ isLine: false });
        }
    }

    getClientOffset = (event) => {
        const canvasEle = document.getElementById('canvas');
        const { pageX, pageY } = event.touches ? event.touches[0] : event;
        const x = pageX - canvasEle.offsetLeft;
        const y = pageY - canvasEle.offsetTop;
        return { x, y }
    }

    drawFromDb = () => {
        var db = this.state.whiteBoardDB;
        console.log(db);
        for (var i in db) {
            if (db[i]['obj'] == 'line') {
                this.drawLine(db[i]['startX'], db[i]['startY'], db[i]['endX'], db[i]['endY']);
            } else {
                this.drawRectangle(db[i]['startX'], db[i]['startY'], db[i]['width'], db[i]['height']);
            }
        }
    }

    drawLine = (startX, startY, endX, endY) => {
        const canvasEle = document.getElementById('canvas');
        const context = canvasEle.getContext('2d');
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    }

    drawRectangle = (startX, startY, width, height) => {
        const canvasEle = document.getElementById('canvas');
        const context = canvasEle.getContext('2d');
        context.beginPath();
        context.rect(startX, startY, width, height);
        context.stroke();
    }

    mouseDownListener = (event) => {
        this.setState({ startPosition: this.getClientOffset(event) });
        this.setState({ isDrawStart: true });
    }

    mouseMoveListener = (event) => {
        if (!this.state.isDrawStart) return;

        this.setState({ lineCoordinates: this.getClientOffset(event) });
        this.clearCanvas();
        this.drawFromDb();
        if (this.state.isLine) {
            this.drawLine(this.state.startPosition.x, this.state.startPosition.y, this.state.lineCoordinates.x, this.state.lineCoordinates.y);
        } else {
            var startX = this.state.startPosition.x < this.state.lineCoordinates.x ? this.state.startPosition.x : this.state.lineCoordinates.x;
            var startY = this.state.startPosition.y < this.state.lineCoordinates.y ? this.state.startPosition.y : this.state.lineCoordinates.y;
            var width = Math.abs(this.state.lineCoordinates.x - this.state.startPosition.x);
            var height = Math.abs(this.state.lineCoordinates.y - this.state.startPosition.y);
            this.drawRectangle(startX, startY, width, height);
        }
    }

    mouseupListener = (event) => {
        this.setState({ isDrawStart: false });

        var newDatabase = this.state.whiteBoardDB;
        if (this.state.isLine) {
            newDatabase.push({ 'obj': 'line', 'startX': this.state.startPosition.x, 'startY': this.state.startPosition.y, 'endX': this.state.lineCoordinates.x, 'endY': this.state.lineCoordinates.y });
        } else {
            var startX = this.state.startPosition.x < this.state.lineCoordinates.x ? this.state.startPosition.x : this.state.lineCoordinates.x;
            var startY = this.state.startPosition.y < this.state.lineCoordinates.y ? this.state.startPosition.y : this.state.lineCoordinates.y;
            var width = Math.abs(this.state.lineCoordinates.x - this.state.startPosition.x);
            var height = Math.abs(this.state.lineCoordinates.y - this.state.startPosition.y);
            newDatabase.push({ 'obj': 'rectangle', 'startX': startX, 'startY': startY, 'width': width, 'height': height });
        }

        this.setState({ whiteBoardDB: newDatabase });
        this.eventSave();
    }

    clearCanvas = () => {
        const canvasEle = document.getElementById('canvas');
        const context = canvasEle.getContext('2d');
        context.clearRect(0, 0, canvasEle.width, canvasEle.height);
    }

    setAsyncState = async (newState) => {
        return new Promise((resolve) => this.setState(newState, resolve));
    }

    render() {
        return (
            <div>
                <div className="container">
                    <div className="row py-5 text-start justify-content-start">
                        <div className="row py-2">
                            <div className="col-4">
                                <p className='fs-1'>White-Board!</p>
                            </div>
                        </div>

                        <div className="row py-2 ">
                            <div className="col-2">
                                <select className="form-select form-select-sm"
                                    onChange={this.eventDropdown}>
                                    <option value="line">Draw a Line</option>
                                    <option value="rectangle">Draw a Rectangle</option>
                                </select>
                            </div>
                            <div className="col-4">
                                <button id="click" type="button" className="btn btn-dark btn-sm" onClick={this.eventClear}>Clear</button>
                            </div>
                        </div>

                        <div className="row py-2">
                            <div className="col-12">
                                <canvas id="canvas" width="800" height="600" style={{ border: "1px solid #333" }}></canvas>
                                <div id="output"></div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        );
    }
}


export default Canvas;
