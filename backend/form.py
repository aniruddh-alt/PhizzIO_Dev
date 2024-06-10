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
    
if __name__ == '__main__':
    socketio.run(app,debug=True,port=5001)
    