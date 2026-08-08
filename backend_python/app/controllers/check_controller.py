from app.database.db import db
from app.models.user_model import User
from app.models.check_model import Check
from app.services.face_recognition_service import FaceRecognitionService
from datetime import datetime, timezone, timedelta, date

def register_by_face(image_file):
    """REQUERIMIENTO: Alta Entrada y Salida mediante reconocimiento facial"""
    folder_name = FaceRecognitionService.recognize_face(image_file)
    if not folder_name:
        return {"error": "Face not recognized"}, 401

    user = User.query.filter(
        User.face_image_path.like(f"%{folder_name}%"),
        User.active == True
    ).first()
    
    if not user:
        return {"error": "User not found"}, 404

    now = datetime.now(timezone.utc)
    today = now.date()
    
    existing_check = Check.query.filter_by(user_id=user.id, date=today).first()

    if not existing_check:
        status = 'on_time'
        if user.schedule:
            schedule_time = datetime.combine(today, user.schedule.check_in)
            schedule_time = schedule_time.replace(tzinfo=timezone.utc)
            tolerance = timedelta(minutes=user.schedule.late_minutes)
            if now > schedule_time + tolerance:
                status = 'late'

        check = Check(
            user_id=user.id,
            date=today,
            check_in=now,
            status=status
        )
        db.session.add(check)
        db.session.commit()
        
        return {
            "message": f"Check-in recorded for {user.name} {user.lastname}",
            "check": check.to_dict(),
            "user_id": user.id,
            "user_name": f"{user.name} {user.lastname}",
            "user_role": user.role.value
        }, 201

    elif not existing_check.check_out:
        existing_check.check_out = now
        db.session.commit()
        
        return {
            "message": f"Check-out recorded for {user.name} {user.lastname}",
            "check": existing_check.to_dict(),
            "user_id": user.id,
            "user_name": f"{user.name} {user.lastname}",
            "user_role": user.role.value
        }, 200

    else:
        return {
            "message": f"{user.name} already completed attendance for today"
        }, 400

def get_today_checks():
    """REQUERIMIENTO: Tabla de asistencias del día"""
    today = date.today()
    checks = Check.query.filter_by(date=today).order_by(Check.check_in.desc()).all()
    return {"checks": [c.to_dict() for c in checks], "date": today.isoformat()}, 200

def get_user_history(user_id, period='month'):
    """REQUERIMIENTO: Historial de usuario con filtro de semana, mes o año"""
    user = User.query.get_or_404(user_id)
    query = Check.query.filter_by(user_id=user_id)
    query = _apply_period_filter(query, period)
    checks = query.order_by(Check.date.desc()).all()
    
    return {
        "user": user.to_dict(),
        "period": period,
        "checks": [c.to_dict() for c in checks]
    }, 200

def get_area_history(area, period='month'):
    """REQUERIMIENTO: Historial de area con filtro de semana, mes o año"""
    query = Check.query.join(User).filter(User.area.ilike(area))
    query = _apply_period_filter(query, period)
    checks = query.order_by(Check.date.desc()).all()
    
    return {
        "area": area,
        "period": period,
        "checks": [c.to_dict() for c in checks]
    }, 200

def _apply_period_filter(query, period):
    """Aplica filtro por período: day, week, month, year"""
    today = date.today()
    
    if period == 'day' or period == 'today':
        return query.filter(Check.date == today)
    elif period == 'week':
        start = today - timedelta(days=today.weekday())
        return query.filter(Check.date >= start)
    elif period == 'month':
        start = today.replace(day=1)
        return query.filter(Check.date >= start)
    elif period == 'year':
        start = today.replace(month=1, day=1)
        return query.filter(Check.date >= start)
    
    return query  # Sin filtro = todos