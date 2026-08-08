from flask import Blueprint, request
from app.controllers import check_controller

check_bp = Blueprint('checks', __name__, url_prefix='/api/checks')

@check_bp.route('/facial', methods=['POST'])
def facial_check():
    """POST /api/checks/facial - Check-in/out por reconocimiento facial"""
    if 'image' not in request.files:
        return {"error": "No image provided"}, 400
    result, status = check_controller.register_by_face(request.files['image'])
    return result, status

@check_bp.route('/today', methods=['GET'])
def today_checks():
    """GET /api/checks/today - Asistencias del día"""
    result, status = check_controller.get_today_checks()
    return result, status

@check_bp.route('/user/<int:user_id>/history', methods=['GET'])
def user_history(user_id):
    """GET /api/checks/user/:id/history?period=month"""
    period = request.args.get('period', 'month')
    result, status = check_controller.get_user_history(user_id, period)
    return result, status

@check_bp.route('/area/<string:area>/history', methods=['GET'])
def area_history(area):
    """GET /api/checks/area/RH/history?period=week"""
    period = request.args.get('period', 'month')
    result, status = check_controller.get_area_history(area, period)
    return result, status