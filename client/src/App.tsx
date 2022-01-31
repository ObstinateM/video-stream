import React from 'react';
import ReactPlayer from 'react-player';
import styled from 'styled-components';

import VideoPlayer from './Components/VideoPlayer';

const Temp = styled.div`
    width: 70%;
`;

function App() {
    return (
        <div className="App">
            <Temp>
                <VideoPlayer />
            </Temp>
        </div>
    );
}

export default App;
