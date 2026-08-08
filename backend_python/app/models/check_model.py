from app.database.db import db
from datetime import datetime, timezone

class Check(db.Model):
    __tablename__ = 'checks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, default=lambda: datetime.now(timezone.utc).date())
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='on_time')  # on_time, late

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": f"{self.user.name} {self.user.lastname}" if self.user else None,
            "user_area": self.user.area if self.user else None,
            "date": self.date.isoformat() if self.date else None,
            "check_in": self.check_in.isoformat() if self.check_in else None,
            "check_out": self.check_out.isoformat() if self.check_out else None,
            "status": self.status
        }