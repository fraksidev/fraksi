import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface TrackedHand { landmarks: NormalizedLandmark[]; handedness: string }
export class HandTracker {
  private landmarker?: HandLandmarker; private stream?: MediaStream;
  async start(video: HTMLVideoElement) {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
    video.srcObject = this.stream; await video.play();
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm");
    this.landmarker = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", delegate: "GPU" }, runningMode: "VIDEO", numHands: 2, minHandDetectionConfidence: .55, minTrackingConfidence: .55 });
  }
  detect(video: HTMLVideoElement, now: number): TrackedHand[] {
    if (!this.landmarker || video.readyState < 2) return [];
    const result = this.landmarker.detectForVideo(video, now);
    return result.landmarks.map((landmarks,index)=>({landmarks,handedness:result.handedness[index]?.[0]?.categoryName??"Unknown"}));
  }
  stop() { this.stream?.getTracks().forEach((t) => t.stop()); this.landmarker?.close(); }
}
