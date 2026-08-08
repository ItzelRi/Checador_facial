from flask import Blueprint, request
from app.controllers import user_controller

user_bp = Blueprint('users', __name__, url_prefix='/api/users')

@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.form.to_dict()
    images = request.files.getlist('images')
    result, status = user_controller.create_user(data, images)
    return result, status

@user_bp.route('/', methods=['GET'])
def get_users():
    # El frontend enviará ?admin_id=1 para verificar permisos
    admin_id = request.args.get('admin_id', type=int)
    result, status = user_controller.get_all_users(admin_id)
    return result, status

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    result, status = user_controller.get_user(user_id)
    return result, status

@user_bp.route('/<int:user_id>', methods=['PUT', 'POST'])
def update_user(user_id):
    # Detectar si es JSON o form-data
    if request.is_json:
        data = request.get_json()
        images = []
    else:
        data = request.form.to_dict()
        images = request.files.getlist('images')
    
    requester_id = request.args.get('requester_id', type=int)
    result, status = user_controller.update_user(user_id, data, images, requester_id)
    return result, status

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    admin_id = request.args.get('admin_id', type=int)
    result, status = user_controller.delete_user(user_id, admin_id)
    return result, status

@user_bp.route('/<int:user_id>/activate', methods=['PUT'])
def activate_user(user_id):
    result, status = user_controller.activate_user(user_id)
    return result, status
    