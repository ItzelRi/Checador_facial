from app.database.db import db
from app.models.user_model import User, RoleEnum
from app.services.face_recognition_service import FaceRecognitionService

def create_user(data, image_files):
    try:
        if not data.get('name') or not data.get('lastname'):
            return {"error": "Name and lastname are required"}, 400

        new_user = User(
            name=data['name'],
            lastname=data['lastname'],
            genre=data.get('genre'),
            occupation=data.get('occupation'),
            area=data.get('area', 'General'),
            role=RoleEnum[data.get('role', 'employee')],
            schedule_id=data.get('schedule_id')
        )
        
        db.session.add(new_user)
        db.session.commit()

        if image_files:
            folder_path = FaceRecognitionService.save_user_faces(new_user, image_files)
            new_user.face_image_path = folder_path
            db.session.commit()

        return {"message": "User created successfully", "user": new_user.to_dict()}, 201

    except KeyError as e:
        db.session.rollback()
        return {"error": f"Invalid role. Use 'admin' or 'employee'"}, 400
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500

def get_all_users(requested_by_id=None):
    """
    Si se pasa requested_by_id, verifica que sea admin.
    Sin JWT, esto es opcional pero útil para el frontend.
    """
    if requested_by_id:
        admin = User.query.get(requested_by_id)
        if not admin or admin.role != RoleEnum.admin:
            return {"error": "Admin access required"}, 403
    
    users = User.query.all()
    return {"users": [u.to_dict() for u in users]}, 200

def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return {"user": user.to_dict()}, 200

def update_user(user_id, data, image_files=None, requested_by_id=None):
    """Solo admin o el propio usuario pueden editar"""
    user = User.query.get_or_404(user_id)
    requester = User.query.get(requested_by_id) if requested_by_id else None
    
    if requester and requester.role != RoleEnum.admin and requester.id != user.id:
        return {"error": "Not authorized to edit this user"}, 403
    
    try:
        updatable_fields = ['name', 'lastname', 'genre', 'occupation', 'area', 'schedule_id', 'pin']
        
        for key, value in data.items():
            if key == 'role' and requester and requester.role == RoleEnum.admin:
                user.role = RoleEnum[value]
            elif key in updatable_fields:
                setattr(user, key, value)
        
        # Manejar nuevas imágenes si se envían
        if image_files:
            folder_path = FaceRecognitionService.save_user_faces(user, image_files)
            user.face_image_path = folder_path
        
        db.session.commit()
        return {"message": "User updated successfully", "user": user.to_dict()}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

def delete_user(user_id, requested_by_id=None):
    """Solo admin puede eliminar"""
    if requested_by_id:
        admin = User.query.get(requested_by_id)
        if not admin or admin.role != RoleEnum.admin:
            return {"error": "Admin access required"}, 403
    
    user = User.query.get_or_404(user_id)
    user.active = False
    db.session.commit()
    return {"message": "User deactivated successfully"}, 200

def activate_user(user_id):
    """Reactivar un usuario inactivo"""
    user = User.query.get_or_404(user_id)
    user.active = True
    db.session.commit()
    return {"message": "User activated successfully", "user": user.to_dict()}, 200

