from app.database.db import db
from datetime import datetime, timezone
import enum

class RoleEnum(enum.Enum):
    admin = 'admin'
    employee = 'employee'

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    genre = db.Column(db.String(20))
    occupation = db.Column(db.String(50))
    area = db.Column(db.String(50), default='General')
    pin = db.Column(db.String(4), nullable=True)
    role = db.Column(db.Enum(RoleEnum), default=RoleEnum.employee, nullable=False)
    face_image_path = db.Column(db.String(255))
    active = db.Column(db.Boolean, default=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedules.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), 
                          onupdate=lambda: datetime.now(timezone.utc))

    schedule = db.relationship('Schedule', backref='users', lazy=True)
    checks = db.relationship('Check', backref='user', lazy=True, cascade="all, delete-orphan")
    permissions = db.relationship('Permission', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "lastname": self.lastname,
            "genre": self.genre,
            "occupation": self.occupation,
            "area": self.area,
            "role": self.role.value,
            "face_image_path": self.face_image_path,
            "active": self.active,
            "schedule_id": self.schedule_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }