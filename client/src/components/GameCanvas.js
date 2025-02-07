'use client'
import "../styles/style.css";

function GameCanvas() {

    return (
        <div className="col-md-6 order-0 order-md-0 position-relative" >
            <button
                id="playButton"
                className="btn btn-primary"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: "20%",
                    left: "100%",
                    transform: "translate(-50%, -50%)",
                    zIndex: '0',
                }}
                onClick={() => startGame}
                >
                Play
            </button>
            <div id="canvasContainer" style={{ height: '500px', zIndex: '-1' }}>
                <canvas id="backgroundCanvas" width={500} height={500}></canvas>
                <canvas id="gameCanvas" width={500} height={500}></canvas>
                <canvas id="explosionCanvas" width={500} height={500}></canvas>
                <div id="videoContainer" className="embed-responsive embed-responsive-4by3">
                    <video id="introductionVideo" className="embed-responsive-item" src="video/introduction.mp4" style={{ display: 'none' }} height={500} width={500}></video>
                </div>
            </div> 
        </div>
    )

}

export default GameCanvas