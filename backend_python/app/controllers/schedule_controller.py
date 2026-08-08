from app.database.db import db
from app.models.schedule_model import Schedule

def create_schedule(data):
    """REQUERIMIENTO: Dar de alta horarios"""
    try:
        schedule = Schedule(
            name=data.get('name'),
            check_in=data.get('check_in'),  # Formato: "HH:MM:SS"
            check_out=data.get('check_out'),
            worked_days=data.get('worked_days', 'Lun,Mar,Mier,Jue,Vier'),
            late_minutes=data.get('late_minutes', 15)
        )
        db.session.add(schedule)
        db.session.commit()
        return {"message": "Schedule created", "schedule": schedule.to_dict()}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

def get_all_schedules():
    """REQUERIMIENTO: Listar todos los horarios"""
    schedules = Schedule.query.all()
    return {"schedules": [s.to_dict() for s in schedules]}, 200

def update_schedule(schedule_id, data):
    """REQUERIMIENTO: Actualizar horarios"""
    schedule = Schedule.query.get_or_404(schedule_id)
    try:
        for key, value in data.items():
            if hasattr(schedule, key):
                setattr(schedule, key, value)
        db.session.commit()
        return {"message": "Schedule updated", "schedule": schedule.to_dict()}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400