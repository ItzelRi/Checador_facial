from app.models.user_model import User, RoleEnum

def login_with_pin(pin):
    """Valida PIN de admin y retorna el usuario"""
    if not pin or len(pin) != 4 or not pin.isdigit():
        return {"error": "PIN must be 4 digits"}, 400
    
    user = User.query.filter_by(
        pin=pin,
        role=RoleEnum.admin,
        active=True
    ).first()
    
    if not user:
        return {"error": "Invalid PIN or not authorized"}, 401
    
    return {
        "message": "Login successful",
        "user": user.to_dict()
    }, 200