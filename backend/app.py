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

load_dotenv()


class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
            return str(obj)
        return super().default(obj)



app = Flask(__name__)
app.secret_key = 'secretkey'
app.config['SESSION_TYPE'] = 'filesystem'
app.json_encoder = CustomJSONEncoder
Session(app)

login_manager = LoginManager()
login_manager.init_app(app)
CORS(app,origins='*')

class User(UserMixin):
    def __init__(self, id):
        self.id = id
        
@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

DATABASE_URL = os.getenv("DATABASE_URL")
# Database connection function
def connect_db():
    return psycopg2.connect(DATABASE_URL)

@app.route('/set-session',methods=['POST'])
def set_session():
    data = request.get_json()
    for key, value in data.items():
        session[key] = value
    return jsonify({'message': 'Session set'})

@app.route('/get-session',methods=['GET'])
def get_session():
    session_data = {key: session[key] for key in session.keys()}
    return jsonify(session_data), 200

@app.route('/clear-session',methods=['POST'])
def clear_session():
    session.clear()
    return jsonify({'message': 'Session cleared'})


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    email = data.get('email')
    
    if not username or not password:
        return jsonify({'message': 'Username or password is missing'}), 400
    
    with connect_db() as conn:
        with conn.cursor() as cur:
            # Check if the username or email already exists
            cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
            existing_user = cur.fetchone()
            if existing_user:
                return jsonify({'message': 'User already exists'}), 400
            
            # Hash the password
            password = hashlib.sha256(password.encode()).hexdigest()
            
            # Insert the user into the users table
            cur.execute("INSERT INTO USERS (username, password_hash, email, role, name) VALUES (%s, %s, %s, %s, %s)", (username, password, email, role, name))
            
            # Get the user_id of the newly inserted user
            cur.execute("SELECT userid FROM USERS WHERE username = %s", (username,))
            user_id = cur.fetchone()[0]
            
            # Insert records into the appropriate table based on the role
            if role == 'physio':
                cur.execute("INSERT INTO PHYSIOTHERAPIST (userid) VALUES (%s)", (user_id,))
            elif role == 'patient':
                cur.execute("INSERT INTO PATIENTS (user_id,physio_id) VALUES (%s,%s)", (user_id,1))
            conn.commit()
            
    return jsonify({'message': 'Signed up'})


@app.route('/api/login',methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print(username,password)
    
    with connect_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT userid, username, password_hash, role, name FROM USERS WHERE username=%s", (username,))
            user = cur.fetchone()
            
            if user and user[2] == hashlib.sha256(password.encode()).hexdigest():
                login_user(User(user[0]))
                user_obj = User(user[0])
                
                if session.get('user') is None:
                    session['user'] = {}
                session['user']['id'] = user[0]
                session['user']['role'] = user[3]
                session['user']['username'] = user[1]
                session['user']['name'] = user[4]
                
                return jsonify({'message': 'Logged in', 'user': {'id': user[0], 'role': user[3], 'username': user[1], 'name': user[4]}})
            else:
                return jsonify({'message': 'Invalid credentials'}), 401
            
@app.route('/api/physio', methods=['GET'])
def get_physio():
    with connect_db() as conn:
        with conn.cursor() as cur:
            # Retrieve physios
            cur.execute("SELECT users.userid, physio_id, name FROM USERS INNER JOIN PHYSIOTHERAPIST ON users.userid=physiotherapist.userid WHERE role = 'physio'")
            physios = cur.fetchall()
            
            # Iterate over physios to fetch their patients
            physio_data = []
            
            for physio in physios:
                user_id = physio[0]
                physio_id = physio[1]
                patients = get_patient_ids(physio_id)
                print(patients)
                
                # Fetch patient details for each physio
                patient_data = []
                for patient_id in patients:
                    cur.execute("SELECT patients.patient_id, username, email, name, injury, age, height, weight FROM users INNER JOIN PATIENTS ON users.userid = PATIENTS.user_id WHERE users.userid = %s", (patient_id,))
                    patient = cur.fetchone()
                    if patient:
                        patient_data.append({
                            'id': patient[0],
                            'username': patient[1],
                            'email': patient[2],
                            'name': patient[3],
                            'injury': patient[4],
                            'age': patient[5],
                            'height': patient[6],
                            'weight': patient[7]
                        })
                
                # Append physio data with their patients
                physio_data.append({
                    'id': physio_id,
                    'name': physio[2],
                    'patients': patient_data
                })

            return jsonify({'physios': physio_data})

@app.route('/api/assign_exercise/<patient_id>', methods=['POST'])
def assign_exer(patient_id):
    if request.method == 'OPTIONS':
        # Preflight request. Reply successfully:
        resp = app.make_default_options_response()

        # Allow the actual request method
        resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'

        # Allow all headers
        resp.headers['Access-Control-Allow-Headers'] = '*'

        return resp
    try:
        data = request.get_json()
        exercise_id = data.get('exerciseName')
        reps = data.get('reps')
        sets = data.get('sets')
        notes = data.get('notes')
        threshold_angle = data.get('angle')
        print(exercise_id, reps, sets, notes, threshold_angle)
        
        with connect_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT exercise_name FROM exercises WHERE exercise_id = %s", (exercise_id,))
                exercise_name = cur.fetchone()[0]
                
                cur.execute("SELECT physio_id FROM patients WHERE patient_id = %s", (patient_id,))
                physio_id = cur.fetchone()[0]
                
                #print((patient_id, physio_id, exercise_name, reps, sets, notes, threshold_angle, exercise_id))
                
                cur.execute("INSERT INTO ASSIGN_EXERCISE (patient_id, physio_id, exercise_name, reps, sets, notes, threshold_angle, assigned_date, exercise_id) VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, %s)", (patient_id, physio_id, exercise_name, reps, sets, notes, threshold_angle, exercise_id))
        
        return jsonify({'message': 'Exercise assigned successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/physio/patient/<id>', methods=['GET'])
def get_physio_patient(id):
    with connect_db() as conn:
        with conn.cursor() as cur:
            # Retrieve physios
            print(id)
            cur.execute("SELECT username, email, name, injury, age, height, weight, DOB, Gender FROM users INNER JOIN PATIENTS ON users.userid = PATIENTS.user_id WHERE PATIENTS.patient_id = %s", (id,))
            patient = cur.fetchone()
            
            exercise_log = get_exercise_log(id)
            exercises = get_exercises(id)
            exercise_list = get_exercise_list()
            return jsonify({'username': patient[0],
                    'email': patient[1],
                    'name': patient[2],
                    'injury': patient[3],
                    'age': patient[4],
                    'height': patient[5],
                    'weight': patient[6], 'DOB': patient[7],'Gender':patient[8], 'exercises': exercises, 'exercise_log': exercise_log,"exercise_list":exercise_list})


@app.route('/api/patient', methods=['GET'])
def get_patient():
    with connect_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT username, email, name, injury, age, height, weight FROM users INNER JOIN PATIENTS ON users.userid = PATIENTS.user_id WHERE users.userid = '7' and users.role = 'patient'")
            patient = cur.fetchone()
            
            exercises=get_exercises(1)
            exercise_log = get_exercise_log(1)
            print(exercises)

            if patient:
                return jsonify({
                    'username': patient[0],
                    'email': patient[1],
                    'name': patient[2],
                    'injury': patient[3],
                    'age': patient[4],
                    'height': patient[5],
                    'weight': patient[6]
                , 'exercises': exercises, 'exercise_log': exercise_log})
            else:
                return jsonify({'message': 'Patient not found'}), 404
            
exercise_functions = {
    '1': squats,
    '2': heel_slides,
    '3': knee_extensions,
    '4': arm_extensions,
}

@app.route('/api/exercise/<patient_id>/<exercise_id>', methods=['POST'])
def exercise(patient_id, exercise_id):
    try:
        exercise_function = exercise_functions.get(exercise_id)
        if exercise_function is None:
            return jsonify({'error': 'Invalid exercise ID'}), 400

        completed, sets, reps, elapsed_time, mistakes = exercise_function()
        print(completed, sets, reps, elapsed_time, mistakes)

        with connect_db() as conn:
            with conn.cursor() as cur:
                print("INSERT INTO PATIENT_EXERCISE_LOG (patient_id, exercise_id, reps_complete, sets_complete, duration, date, mistakes) VALUES (%s, %s, %s, %s, make_interval(secs => %s), CURRENT_DATE,%s)", (patient_id, exercise_id, reps, sets, elapsed_time,mistakes))
                cur.execute("INSERT INTO PATIENT_EXERCISE_LOG (patient_id, exercise_id, reps_complete, sets_complete, duration, date, mistakes) VALUES (%s, %s, %s, %s, make_interval(secs => %s), CURRENT_DATE, %s)", (patient_id, exercise_id, reps, sets, elapsed_time,mistakes))
        return jsonify({'message': 'Exercise completed'})

    except psycopg2.Error as e:
        print("Database error:", e.pgerror)
        print("Database error details:", e.diag.message_primary)
        return jsonify({'error': 'Database error: ' + str(e)}), 500
    except Exception as e:
        print("Unexpected error:", str(e))
        traceback.print_exc()  # This will print the stack trace
        return jsonify({'error': 'Unexpected error: ' + str(e)}), 500
    

        



@app.route('/api/logout',methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'})


@app.route('/api/data',methods=['GET'])
def get_data():
    # Simulate some data
    data = {'message': 'Hello from Flask API'}
    return jsonify(data)


### FUNCTIONS
def get_patient_ids(physio_id):
    with connect_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id FROM patients INNER JOIN physiotherapist ON patients.physio_id = physiotherapist.physio_id WHERE physiotherapist.physio_id = %s", (physio_id,))
            patient_ids = cur.fetchall()  # Fetch all patient user_ids
            return [patient_id[0] for patient_id in patient_ids]  # Extract user_ids from the fetched rows
        
def get_exercises(patient_id):
    with connect_db() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT exercise_id,assign_exercise.exercise_name,reps,sets,notes,threshold_angle,assigned_date FROM assign_exercise WHERE patient_id = 1')
            exercises = cur.fetchall()
            exercises_obj = [{'exercise_id': exercise[0], 'exercise_name': exercise[1], 'exercise_reps': exercise[2], 'exercise_sets': exercise[3], 'notes': exercise[4], 'angle': exercise[5],'date':exercise[6]} for exercise in exercises]
            return exercises_obj
def get_exercise_log(patient_id):
    with connect_db() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT patient_exercise_log.exercise_id, assign_exercise.exercise_name, reps_complete, sets_complete, duration, date, mistakes FROM patient_exercise_log INNER JOIN assign_exercise on patient_exercise_log.exercise_id = assign_exercise.exercise_id WHERE patient_exercise_log.patient_id = %s', (patient_id,))
            exercise_log = cur.fetchall()
            exercise_log_obj = [{'exercise_id': log[0], 'exercise_name': log[1], 'reps_complete': log[2], 'sets_complete': log[3], 'duration': log[4], 'date': log[5], 'mistakes':log[6]} for log in exercise_log]
            return exercise_log_obj
def get_exercise_list():
    with connect_db() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT exercise_id, exercise_name FROM exercises')
            exercises = cur.fetchall()
            exercise_list_obj = [{'exercise_id': exercise[0], 'exercise_name': exercise[1]} for exercise in exercises]
            return exercise_list_obj

if __name__ == '__main__':
    app.run(debug=True)  # Set debug=False for production
