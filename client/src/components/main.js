import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Canvas from './canvas';


class Main extends Component {
    render() {
        console.log('1');
        return (
            <div>
                <Route path="/canvas" component={Canvas} />
            </div>
        )
    }
}

export default Main;