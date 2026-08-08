from flask import Blueprint, request
from app.controllers import auth_controller

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login/pin', methods=['POST'])
def login_pin():
    data = request.get_json()
    pin = data.get('pin', '')
    result, status = auth_controller.login_with_pin(pin)
    return result, status