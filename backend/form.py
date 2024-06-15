from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import os
from flask_session import Session
import hashlib
from dotenv import load_dotenv
import psycopg2
from exercises import *
import traceback
from flask.json import JSONEncoder
from datetime import timedelta
from flask_socketio import SocketIO, emit
import base64


load_dotenv()

app = Flask(__name__)

app.secret_key = 'secretkey'
app.config['SESSION_TYPE'] = 'filesystem'


CORS(app,origins='*')
socketio = SocketIO(app, cors_allowed_origins="*",resources={r"/*":{"origins":"*"}})


@socketio.on('connect')
def connect():
    print('connected')
    emit('message', 'connected')

@socketio.on('disconnect')
def disconnect():
    print('disconnected')
    emit('message', 'disconnected')

@socketio.on('video')
def video(data):
    emit('video', {'data':data}, broadcast=True)
    
    

def knee_extensions(reps=5, total_sets=1, threshold_angle=140):
    sets = 0
    status = None
    count = 0
    side = "left"
    over_extension = False
    mistakes = 0
    mistake_flag = False
    start_time = time.time()
    start = True
    circle_radius = 0  # Initialize circle_radius with a default value
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            frame = cv2.flip(frame, 1)
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            
            results = pose.process(image)
            
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            try:
                # Extract landmarks for right shoulder, elbow, and wrist
                if side == "left":
                    landmarks = results.pose_landmarks.landmark
                    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                    knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
                    heel = [landmarks[mp_pose.PoseLandmark.RIGHT_HEEL.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HEEL.value].y]
                elif side == 'right':
                    landmarks = results.pose_landmarks.landmark
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                    heel = [landmarks[mp_pose.PoseLandmark.LEFT_HEEL.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HEEL.value].y]
                
                # Calculate angle between the shoulder, elbow, and wrist
                knee_angle = calculate_angle(hip, knee, heel)
                if start == True:
                    # Draw semi-circle at elbow
                    cv2.ellipse(image, tuple(np.multiply(knee, [640, 480]).astype(int)), (80, 80), 0, 0, (int(knee_angle)), (255, 0, 0), 2)
                    
                    # Calculate proportion of current angle to threshold angle
                    proportion = max(0, min(1, knee_angle / threshold_angle))
                    # Calculate radius of filled circle based on proportion
                    filled_circle_radius = int(proportion * threshold_angle / 4)

                    # Draw hollow circle at elbow with maximum radius
                    cv2.circle(image, tuple(np.multiply(knee, [640, 480]).astype(int)), int(threshold_angle / 4), (255, 255, 255), 2)

                    # Draw filled circle at elbow with radius proportional to the angle
                    if int(threshold_angle / 4) - 5 < filled_circle_radius < int(threshold_angle / 4) + 5:
                        cv2.circle(image, tuple(np.multiply(knee, [640, 480]).astype(int)), filled_circle_radius, (0, 255, 0), -1)
                    elif filled_circle_radius > int(threshold_angle / 4):
                        cv2.circle(image, tuple(np.multiply(knee, [640, 480]).astype(int)), filled_circle_radius, (0, 0, 255), -1)
                    else:
                        cv2.circle(image, tuple(np.multiply(knee, [640, 480]).astype(int)), filled_circle_radius, (255, 0, 0), -1)

                    if knee_angle < 80:
                        if status == "Lower":
                            count += 1
                        status = 'Raise'
                        filled_circle_radius = 0
                    elif knee_angle >= threshold_angle and knee_angle < threshold_angle + 10:
                        status = 'Lower'
                        
                    if knee_angle >= threshold_angle + 20:
                        if not mistake_flag:
                            mistakes += 1
                            mistake_flag = True
                        over_extension = True
                        cv2.putText(image, "Do not over contract!", (250, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                        if over_extension:
                            over_extension = False
                        cv2.circle(image, tuple(np.multiply(knee, [640, 480]).astype(int)), circle_radius, (0, 0, 255), -1)
                    else:
                        mistake_flag=False

                    if status == 'Raise':
                        cv2.putText(image, "Extend!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                    elif status == 'Lower':
                        cv2.putText(image, "Contract!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

                circle_radius = int(knee_angle / 4)
                cv2.putText(image, f"Count: {count} / {reps}", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)   
                cv2.putText(image, f"Set: {sets} / {total_sets}", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                
                # Display frame
                if count < 2 and side == 'right':
                    cv2.putText(image, "Set Complete! Time to switch sides!", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    
                if count == reps:
                    sets += 0.5
                    count = 0
                    if sets == total_sets:
                        cv2.putText(image, "Workout Complete!", (200, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                        elapsed_time = time.time() - start_time
                        break
                    else:
                        cv2.putText(image, "Set Complete! Time to switch sides!", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                        if side == "left":
                            side = "right"
                        elif side == "right":
                            side = "left"
                        status = None
                        
            except:
                pass
            
            cv2.imshow('Knee Extensions', image)
            
            # Exit loop if 'q' is pressed
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

        # Release video capture and close all windows
        cap.release()
        cv2.destroyAllWindows()
        return 'completed', sets, reps, elapsed_time, mistakes    

def arm_extensions(reps=5, total_sets=1, threshold_angle=120):
    sets = 0
    status = None
    count = 0
    side = "left"
    mistakes = 0
    start_time = time.time()
    elapsed_time = 0  # Initialize elapsed_time outside the try block
    mistake_flag = False
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            frame = cv2.flip(frame, 1)
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            
            results = pose.process(image)
            
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            try:
                # Extract landmarks for right shoulder, elbow, and wrist
                if side == "left":
                    landmarks = results.pose_landmarks.landmark
                    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                elif side=='right':
                    landmarks = results.pose_landmarks.landmark
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                
                # Calculate angle between the shoulder, elbow, and wrist
                angle = calculate_angle(shoulder, elbow, wrist)
                shoulder_angle = calculate_angle(hip, shoulder, elbow)
                
                # Draw semi-circle at elbow
                if side == "left":
                    cv2.ellipse(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), (80, 80), 0, 0, -(int(angle)), (255, 0, 0), 2)
                else:
                    cv2.ellipse(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), (80, 80), 0, 0, -(int(angle)), (255, 0, 0), 2)
                
                # Check if arms are raised above threshold angle (e.g., 120 degrees)
                if shoulder_angle > 100:
                    if not mistake_flag:
                        mistakes += 1
                        mistake_flag = True
                    cv2.putText(image, f"Please lower your elbow!", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    cv2.circle(image, tuple(np.multiply(shoulder, [640, 480]).astype(int)), 10, (0, 0, 255), -1)  # Red spot on shoulder
                    
                elif shoulder_angle < 70:
                    if not mistake_flag:
                        mistakes += 1
                        mistake_flag = True
                    cv2.putText(image, f"Please raise your elbow!", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    cv2.circle(image, tuple(np.multiply(shoulder, [640, 480]).astype(int)), 10, (0, 0, 255), -1)  # Red spot on shoulder
                else:
                    mistake_flag = False
                    cv2.circle(image, tuple(np.multiply(shoulder, [640, 480]).astype(int)), 10, (0, 255, 0), -1)  # Green spot on shoulder
                
                # Calculate proportion of current angle to threshold angle
                proportion = max(0, min(1, angle / threshold_angle))
                # Calculate radius of filled circle based on proportion
                filled_circle_radius = int(proportion * threshold_angle / 4)

                # Draw hollow circle at elbow with maximum radius
                cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), int(threshold_angle / 4), (255, 255, 255), 2)

                # Draw filled circle at elbow with radius proportional to the angle
                if int(threshold_angle / 4)-5 < filled_circle_radius < int(threshold_angle / 4)+5:
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), filled_circle_radius, (0, 255, 0), -1)
                elif filled_circle_radius > int(threshold_angle / 4):
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), filled_circle_radius, (0, 0, 255), -1)
                else:
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), filled_circle_radius, (255, 0, 0), -1)
                

                if angle >= threshold_angle and angle <threshold_angle+10:
                    if status == "Lower":
                        count += 1
                    status = 'Raise'
                    # Reset filled circle when threshold angle is met
                    filled_circle_radius = 0
                elif angle > threshold_angle+10:
                    cv2.putText(image, "Do not over extend!", (250, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), circle_radius, (0, 0, 255), -1)
                elif angle < 50:
                    status = 'Lower'
                
                if status == 'Raise':
                    cv2.putText(image, "Contract!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                elif status == 'Lower':
                    cv2.putText(image, "Extend!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            except:
                pass
            circle_radius = int(angle/4)
            #cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), circle_radius, (255, 0, 0), -1)  # Red spot on elbow
            
            cv2.putText(image,f"Count: {count} / {reps}", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)   
            cv2.putText(image,f"Set: {sets} / {total_sets}", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

            # Display frame
            if count == reps:
                sets+=0.5
                count = 0
                if sets == total_sets:
                    cv2.putText(image, "Workout Complete!", (200, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    elapsed_time = time.time() - start_time
                    break
                else:
                    cv2.putText(image, "Set Complete! Time to switch sides!", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    if side == "left":
                        side = "right"
                    elif side == "right":
                        side = "left"
                    status = None
            
            cv2.imshow('Arm Extensions', image)
            
            # Exit loop if 'q' is pressed
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break
        
        # Release video capture and close all windows
        cap.release()
        cv2.destroyAllWindows()
        return 'completed', sets, reps, elapsed_time, mistakes # Return elapsed_time outside the loop

def arm_extensions_stream(reps=5, total_sets=1, threshold_angle=120):
    sets = 0
    status = None
    count = 0
    side = "left"
    mistakes = 0
    start_time = time.time()
    elapsed_time = 0  # Initialize elapsed_time outside the try block
    mistake_flag = False
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            frame = cv2.flip(frame, 1)
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            
            results = pose.process(image)
            
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            try:
                # Extract landmarks for right shoulder, elbow, and wrist
                if side == "left":
                    landmarks = results.pose_landmarks.landmark
                    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                elif side=='right':
                    landmarks = results.pose_landmarks.landmark
                    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                
                # Calculate angle between the shoulder, elbow, and wrist
                angle = calculate_angle(shoulder, elbow, wrist)
                shoulder_angle = calculate_angle(hip, shoulder, elbow)
                
                # Draw semi-circle at elbow
                if side == "left":
                    cv2.ellipse(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), (80, 80), 0, 0, -(int(angle)), (255, 0, 0), 2)
                else:
                    cv2.ellipse(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), (80, 80), 0, 0, -(int(angle)), (255, 0, 0), 2)
                
                # Check if arms are raised above threshold angle (e.g., 120 degrees)
                if shoulder_angle > 100:
                    if not mistake_flag:
                        mistakes += 1
                        mistake_flag = True
                    cv2.putText(image, f"Please lower your elbow!", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    cv2.circle(image, tuple(np.multiply(shoulder, [640, 480]).astype(int)), 10, (0, 0, 255), -1)  # Red spot on shoulder
                    
                elif shoulder_angle < 70:
                    if not mistake_flag:
                        mistakes += 1
                        mistake_flag = True
                    cv2.putText(image, f"Please raise your elbow!", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    cv2.circle(image, tuple(np.multiply(shoulder, [640, 480]).astype(int)), 10, (0, 0, 255), -1)  # Red spot on shoulder
                else:
                    mistake_flag = False
                    cv2.circle(image, tuple(np.multiply(shoulder, [640, 480]).astype(int)), 10, (0, 255, 0), -1)  # Green spot on shoulder
                
                # Calculate proportion of current angle to threshold angle
                proportion = max(0, min(1, angle / threshold_angle))
                # Calculate radius of filled circle based on proportion
                filled_circle_radius = int(proportion * threshold_angle / 4)

                # Draw hollow circle at elbow with maximum radius
                cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), int(threshold_angle / 4), (255, 255, 255), 2)

                # Draw filled circle at elbow with radius proportional to the angle
                if int(threshold_angle / 4)-5 < filled_circle_radius < int(threshold_angle / 4)+5:
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), filled_circle_radius, (0, 255, 0), -1)
                elif filled_circle_radius > int(threshold_angle / 4):
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), filled_circle_radius, (0, 0, 255), -1)
                else:
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), filled_circle_radius, (255, 0, 0), -1)
                

                if angle >= threshold_angle and angle <threshold_angle+10:
                    if status == "Lower":
                        count += 1
                    status = 'Raise'
                    # Reset filled circle when threshold angle is met
                    filled_circle_radius = 0
                elif angle > threshold_angle+10:
                    cv2.putText(image, "Do not over extend!", (250, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), circle_radius, (0, 0, 255), -1)
                elif angle < 50:
                    status = 'Lower'
                
                if status == 'Raise':
                    cv2.putText(image, "Contract!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                elif status == 'Lower':
                    cv2.putText(image, "Extend!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            except:
                pass
            circle_radius = int(angle/4)
            #cv2.circle(image, tuple(np.multiply(elbow, [640, 480]).astype(int)), circle_radius, (255, 0, 0), -1)  # Red spot on elbow
            
            cv2.putText(image,f"Count: {count} / {reps}", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)   
            cv2.putText(image,f"Set: {sets} / {total_sets}", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

            # Display frame
            if count == reps:
                sets+=0.5
                count = 0
                if sets == total_sets:
                    cv2.putText(image, "Workout Complete!", (200, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    elapsed_time = time.time() - start_time
                    break
                else:
                    cv2.putText(image, "Set Complete! Time to switch sides!", (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    if side == "left":
                        side = "right"
                    elif side == "right":
                        side = "left"
                    status = None
            ret, buffer = cv2.imencode('.jpg', image)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        # Release video capture and close all windows
        cap.release()
        cv2.destroyAllWindows()
        #return 'completed', sets, reps, elapsed_time, mistakes # Return elapsed_time outside the loo
    
if __name__ == '__main__':
    socketio.run(app,debug=True,port=5001)
    