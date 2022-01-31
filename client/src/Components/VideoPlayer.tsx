import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Video = styled.video`
    width: 100%;
    height: auto;
    cursor: ${(props: { visible: boolean }) => (props.visible ? 'none' : 'pointer')};
`;

const Player = styled.div`
    position: relative;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;

    & > * {
        color: white;
    }
    overflow: hidden;
`;

const PlayerControlShadow = styled.div`
    visibility: ${(props: { visible: Boolean }) => (props.visible ? 'visible' : 'hidden')};
    position: absolute;
    bottom: ${(props: { visible: Boolean }) => (props.visible ? '0' : '-75px')};
    left: 0;
    height: 120px;
    width: 100%;
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.3) 45.31%,
        rgba(0, 0, 0, 0.7) 100%
    );
    transition: all 0.5s ease-in-out;
`;

const PlayerButton = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    margin-left: 25px;
    margin-bottom: 25px;
    width: calc(100% - 50px);
    display: flex;
    height: 30px;

    & button {
        background: transparent;
        border: none !important;
        outline: none !important;
        cursor: pointer;
        height: 100%;
    }

    & button img {
        height: 100%;
        width: auto;
        margin: 0;
        padding: 0;
    }
`;

const PlayerTitle = styled.h3`
    margin: 0;
`;

const PlayerCenter = styled.div`
    justify-self: center;
    margin-left: auto;
    margin-right: auto;
`;

const Progress = styled.progress`
    position: absolute;
    bottom: 45px;
    left: 0;
    width: 100%;
    height: 5px;
    transition: all 0.2s;

    /* Reset the default appearance */
    -webkit-appearance: none;
    appearance: none;

    &::-webkit-progress-bar {
        background-color: #eee;
        border-radius: 5px;
    }

    &::-webkit-progress-value {
        background-color: #0032fe;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        background-size: 35px 20px, 100% 100%, 100% 100%;
    }

    &:hover {
        height: 10px;
    }
`;

export default function VideoPlayer(props: any) {
    const video = useRef<HTMLVideoElement>(null);
    const videoPlayer = useRef<HTMLDivElement>(null);
    const progressBar = useRef<HTMLProgressElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isControlsHidden, setIsControlsHidden] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePlay = (e?: React.MouseEvent<HTMLElement>) => {
        e && e.preventDefault();
        if (video.current) {
            isPlaying ? video.current.pause() : video.current.play();
            updateProgressTime();
            setIsPlaying(!isPlaying);
        }
    };

    const handleChangeTimer = (time: number) => {
        if (video.current) {
            video.current.currentTime += time;
            updateProgressTime();
        }
    };

    const handleMute = (e?: React.MouseEvent<HTMLElement>) => {
        e && e.preventDefault();
        if (video.current) {
            video.current.muted = !video.current.muted;
            setIsMuted(video.current.muted);
        }
    };

    const handleFullScreen = (e?: React.MouseEvent<HTMLElement>) => {
        e && e.preventDefault();
        if (videoPlayer.current) {
            isFullScreen ? document.exitFullscreen() : videoPlayer.current.requestFullscreen();
            setIsFullScreen(!isFullScreen);
        }
    };

    const handleSpeed = (e?: React.MouseEvent<HTMLElement>) => {
        e && e.preventDefault();
        if (video.current) {
            video.current.playbackRate = video.current.playbackRate === 1 ? 2 : 1;
        }
    };

    const updateProgressTime = () => {
        video.current && setProgress((video.current.currentTime / video.current.duration) * 100);
    };

    useEffect(() => {
        let controlsTimeout: NodeJS.Timeout;
        let progressRefresh: NodeJS.Timeout;

        progressRefresh = setInterval(() => {
            updateProgressTime();
        }, 1000);

        progressBar.current &&
            progressBar.current.addEventListener('click', e => {
                if (video.current && progressBar.current) {
                    console.log(
                        (e.offsetX / progressBar.current.offsetWidth) * video.current.duration
                    );
                    const duration =
                        (e.offsetX / progressBar.current.offsetWidth) * video.current.duration;
                    video.current.currentTime = duration;
                    updateProgressTime();
                }
            });

        videoPlayer.current &&
            videoPlayer.current.addEventListener('mousemove', (e: MouseEvent) => {
                setIsControlsHidden(true);
                clearTimeout(controlsTimeout);
                controlsTimeout = setTimeout(function () {
                    setIsControlsHidden(false);
                }, 2000);
            });

        // TODO: Add video shortcuts
        // document.addEventListener('keyup', (e: KeyboardEvent) => {
        //     console.log(e.key);
        //     const { key } = e;
        //     switch (key) {
        //         case ' ':
        //             handlePlay();
        //             break;
        //         case 'ArrowLeft':
        //             handleChangeTimer(-5);
        //             break;
        //         case 'ArrowRight':
        //             handleChangeTimer(5);
        //             break;
        //         case 'm':
        //             handleMute();
        //             break;
        //         case 'f':
        //             handleFullScreen();
        //             break;
        //         default:
        //             break;
        //     }
        // });

        return () => {
            clearInterval(progressRefresh);
            clearTimeout(controlsTimeout);
            videoPlayer.current && videoPlayer.current.removeEventListener('mousemove', () => {});
            progressBar.current && progressBar.current.removeEventListener('click', () => {});
        };
    }, [videoPlayer.current]);

    return (
        <>
            <Player id="video" ref={videoPlayer}>
                <Video
                    ref={video}
                    src="http://localhost:3001/api/public/video?watch=tuto.mp4"
                    visible={!isControlsHidden}
                    onClick={handlePlay}
                ></Video>
                <PlayerControlShadow visible={isControlsHidden}>
                    <PlayerButton>
                        <div>
                            <Progress max="100" value={progress} ref={progressBar}></Progress>
                        </div>
                        <div>
                            <button onClick={handlePlay}>
                                <img
                                    src={
                                        process.env.PUBLIC_URL +
                                        (isPlaying ? '/images/pause.svg' : '/images/play.svg')
                                    }
                                    alt="play"
                                />
                            </button>
                            <button onClick={() => handleChangeTimer(-10)}>
                                <img
                                    src={process.env.PUBLIC_URL + '/images/less_ten.svg'}
                                    alt="-10"
                                />
                            </button>
                            <button onClick={() => handleChangeTimer(10)}>
                                <img
                                    src={process.env.PUBLIC_URL + '/images/plus_ten.svg'}
                                    alt="+10"
                                />
                            </button>
                            <button onClick={handleMute}>
                                <img
                                    src={
                                        process.env.PUBLIC_URL +
                                        (isMuted ? '/images/mute.svg' : '/images/sound.svg')
                                    }
                                    alt="volume"
                                />
                            </button>
                        </div>
                        <PlayerCenter>
                            <PlayerTitle>Channel - Lorem Ipsum Disert</PlayerTitle>
                        </PlayerCenter>
                        <div>
                            <button onClick={handleSpeed}>
                                <img
                                    src={process.env.PUBLIC_URL + '/images/races.svg'}
                                    alt="speed"
                                />
                            </button>
                            <button onClick={handleFullScreen}>
                                <img
                                    src={
                                        process.env.PUBLIC_URL +
                                        (isFullScreen
                                            ? '/images/unfullscreen.svg'
                                            : '/images/fullscreen.svg')
                                    }
                                    alt="unfullscreen"
                                />
                            </button>
                        </div>
                    </PlayerButton>
                </PlayerControlShadow>
            </Player>
        </>
    );
}
