from app.database.db import db
from datetime import datetime, timezone

class Schedule(db.Model):
    __tablename__ = 'schedules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)  # "Matutino", "Vespertino"
    check_in = db.Column(db.Time, nullable=False)  # Hora entrada
    check_out = db.Column(db.Time, nullable=False)  # Hora salida
    worked_days = db.Column(db.String(100))  # "Lun,Mar,Mier,Jue,Vier"
    late_minutes = db.Column(db.Integer, default=15)  # Minutos tolerancia
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "check_in": self.check_in.strftime('%H:%M:%S') if self.check_in else None,
            "check_out": self.check_out.strftime('%H:%M:%S') if self.check_out else None,
            "worked_days": self.worked_days,
            "late_minutes": self.late_minutes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }