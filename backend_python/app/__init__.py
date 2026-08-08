from flask import Flask, send_from_directory
from .config import Config
from .database.db import db
from flask_migrate import Migrate
from flask_cors import CORS
import os

migrate = Migrate()

def _clean_deepface_cache():
    """Elimina archivos .pkl para forzar reindexado de rostros"""
    faces_path = os.path.join(os.getcwd(), 'uploads', 'faces')
    if os.path.exists(faces_path):
        count = 0
        for root, dirs, files in os.walk(faces_path):
            for file in files:
                if file.endswith('.pkl'):
                    file_path = os.path.join(root, file)
                    os.remove(file_path)
                    count += 1
        if count > 0:
            print(f"[IA] 🗑️ {count} archivos de caché eliminados")
    print("[IA] ✅ Caché de DeepFace limpiado")

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Registrar blueprints
    from .routes.user_routes import user_bp
    from .routes.check_routes import check_bp
    from .routes.schedule_routes import schedule_bp
    from .routes.permission_routes import permission_bp
    from .routes.auth_routes import auth_bp

    app.register_blueprint(user_bp)
    app.register_blueprint(check_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(permission_bp)
    app.register_blueprint(auth_bp)

    # ✅ Servir archivos estáticos (fotos de usuarios)
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(os.path.join(os.getcwd(), 'uploads'), filename)

    # Limpiar caché y crear tablas al iniciar
    with app.app_context():
        _clean_deepface_cache()
        db.create_all()
        from .services.face_recognition_service import FaceRecognitionService
        FaceRecognitionService.preload_model()
    return app