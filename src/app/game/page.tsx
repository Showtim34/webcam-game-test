'use client'
import Navbar from "@/app/components/Navbar";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from "react-webcam";
import React, { useState, useEffect, useRef } from 'react';
import * as posenet from '@tensorflow-models/posenet'; // Assurez-vous d'installer ce package
import styles from "./styles.module.css";

const PoseNetComponent = () => {
    const videoRef = useRef(null);
    const ballRef = useRef(null);
    const noseRef = useRef(null);
    const [score, setScore] = useState(0);
    let lastKnownPosition = 'bottom'
    let lastScore = 0
    let maxHeight = 640
    let maxBouce = maxHeight - 90
    let minScore = 0.3

    useEffect(() => {
        tf.setBackend('webgl').then(() => {
            console.log("Backend WebGL activé");
            // Vous pouvez initialiser votre modèle ici
        });

        console.log("use effect")
        const init = async () => {
            if (!videoRef.current) return;
            try {
                //const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                //videoRef.current.srcObject = stream;
                const net = await posenet.load();
                setTimeout(() => {
                    detectPose(net, videoRef.current.video);
                }, 2000);
            } catch (e) {
                console.error(e);
            }
        };

        init();
    }, []);

    const detectPose = async (net, video) => {
        const pose = await net.estimateSinglePose(video);
        pose.keypoints.forEach((keypoint) => {
                if(keypoint.part == "nose")
                {
                    let x = keypoint.position.x - 24
                    let y = keypoint.position.y - 60
                    noseRef.current.style.top = y +'px';
                    noseRef.current.style.right = x + 'px';

                    //noseRef.current.innerHTML = keypoint.position.y + ' - ' + keypoint.position.x
                }

            if (keypoint.part === "leftWrist" && keypoint.score > minScore && keypoint.position.x > 500) {
                if (keypoint.position.y < maxBouce && lastKnownPosition === 'bottom') {
                    lastKnownPosition = 'top'; // Mise à jour de la position locale
                    document.getElementById("code").innerText = '\nTOP X :' + keypoint.position.x + ' \nY : ' + keypoint.position.y  + '\n Bounce' + maxBouce + '\n SCORE' + keypoint.score;
                }
                if (keypoint.position.y >= maxBouce && lastKnownPosition === 'top') {
                    lastKnownPosition = 'bottom'
                    lastScore = lastScore+ 1
                    setScore(lastScore);
                    ballRef.current.classList.add(styles.gelatine);
                    setTimeout(() => {
                        ballRef.current.classList.remove(styles.gelatine);
                    }, 3000)
                    document.getElementById("code").innerText = '\nBOTTOM X :' + keypoint.position.x + ' \nY : ' + keypoint.position.y  + '\n Bounce' + maxBouce + '\n SCORE' + keypoint.score;
                }
            }

            if (keypoint.part === "leftWrist" && keypoint.score <= minScore) {
                //console.log("JE NE VOIS PAS LA MAIN GAUCHE", keypoint.score)
            }
        });

       requestAnimationFrame(() => detectPose(net, video));
    };


    return (
        <main>
            <div className={styles.webcamContainer}>
                <Webcam ref={videoRef} width="800" height={maxHeight} mirrored={true}/>
                <div className={`${styles.ball}`} ref={ballRef}></div>
                <span className={`${styles.nose}`} ref={noseRef}></span>
            </div>
            <div className={styles.score}>
                Score: {score}
                <pre id="code" className={styles.pre}></pre>
                <em>Il faut dribbler avec la balle orange</em>
            </div>

        </main>
    );
};

export default PoseNetComponent;
