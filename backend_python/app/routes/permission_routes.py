from flask import Blueprint, request
from app.controllers import permission_controller

permission_bp = Blueprint('permissions', __name__, url_prefix='/api/permissions')

@permission_bp.route('/', methods=['POST'])
def create_permission():
    data = request.get_json()
    result, status = permission_controller.create_permission(data)
    return result, status

@permission_bp.route('/', methods=['GET'])
def get_all_permissions():
    admin_id = request.args.get('admin_id', type=int)
    result, status = permission_controller.get_all_permissions(admin_id)
    return result, status

@permission_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_permissions(user_id):
    requester_id = request.args.get('requester_id', type=int)
    result, status = permission_controller.get_user_permissions(user_id, requester_id)
    return result, status

@permission_bp.route('/<int:permission_id>', methods=['PUT'])
def update_permission(permission_id):
    data = request.get_json()
    requester_id = request.args.get('requester_id', type=int)
    result, status = permission_controller.update_permission(permission_id, data, requester_id)
    return result, status

@permission_bp.route('/<int:permission_id>', methods=['DELETE'])
def delete_permission(permission_id):
    requester_id = request.args.get('requester_id', type=int)
    result, status = permission_controller.delete_permission(permission_id, requester_id)
    return result, status