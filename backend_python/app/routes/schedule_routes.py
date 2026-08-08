from flask import Blueprint, request
from app.controllers import schedule_controller

schedule_bp = Blueprint('schedules', __name__, url_prefix='/api/schedules')

@schedule_bp.route('/', methods=['POST'])
def create_schedule():
    """POST /api/schedules - Crear horario"""
    data = request.get_json()
    result, status = schedule_controller.create_schedule(data)
    return result, status

@schedule_bp.route('/', methods=['GET'])
def get_schedules():
    """GET /api/schedules - Listar horarios"""
    result, status = schedule_controller.get_all_schedules()
    return result, status

@schedule_bp.route('/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    """PUT /api/schedules/:id - Actualizar horario"""
    data = request.get_json()
    result, status = schedule_controller.update_schedule(schedule_id, data)
    return result, status