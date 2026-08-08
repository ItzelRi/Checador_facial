from app.database.db import db
from app.models.permission_model import Permission
from app.models.user_model import User, RoleEnum

def create_permission(data):
    """Cualquier usuario puede crear su propio permiso"""
    try:
        user = User.query.get(data.get('user_id'))
        if not user or not user.active:
            return {"error": "User not found"}, 404

        permission = Permission(
            user_id=data['user_id'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            reason=data.get('reason'),
            status='pending'
        )
        db.session.add(permission)
        db.session.commit()
        return {"message": "Permission request created", "permission": permission.to_dict()}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

def get_all_permissions(requested_by_id=None):
    if requested_by_id:
        admin = User.query.get(requested_by_id)
        if not admin or admin.role != RoleEnum.admin:
            return {"error": "Admin access required"}, 403
    
    permissions = Permission.query.order_by(Permission.created_at.desc()).all()
    return {"permissions": [p.to_dict() for p in permissions]}, 200

def get_user_permissions(user_id, requested_by_id=None):
    requester = User.query.get(requested_by_id) if requested_by_id else None
    
    if requester and requester.role != RoleEnum.admin and requester.id != user_id:
        return {"error": "Not authorized"}, 403
    
    permissions = Permission.query.filter_by(user_id=user_id)\
        .order_by(Permission.created_at.desc()).all()
    return {"permissions": [p.to_dict() for p in permissions]}, 200

def update_permission(permission_id, data, requested_by_id=None):
    """Editar permiso"""
    permission = Permission.query.get_or_404(permission_id)
    requester = User.query.get(requested_by_id) if requested_by_id else None
    
    if requester and requester.role != RoleEnum.admin and requester.id != permission.user_id:
        return {"error": "Not authorized"}, 403
    
    try:
        allowed_fields = ['start_date', 'end_date', 'reason', 'status']
        
        for key, value in data.items():
            if key in allowed_fields:
                setattr(permission, key, value)
        
        # Si NO es admin (o no hay requester), y no se envió status → volver a pending
        if (not requester or requester.role != RoleEnum.admin) and 'status' not in data:
            permission.status = 'pending'
        
        db.session.commit()
        return {"message": "Permission updated", "permission": permission.to_dict()}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400

def delete_permission(permission_id, requested_by_id=None):
    permission = Permission.query.get_or_404(permission_id)
    requester = User.query.get(requested_by_id) if requested_by_id else None
    
    if requester and requester.role != RoleEnum.admin and requester.id != permission.user_id:
        return {"error": "Not authorized"}, 403
    
    try:
        db.session.delete(permission)
        db.session.commit()
        return {"message": "Permission deleted"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 400