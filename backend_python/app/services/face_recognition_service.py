import os
import uuid
import traceback
from deepface import DeepFace
from werkzeug.utils import secure_filename

class FaceRecognitionService:
    BASE_UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'faces')
    TEMP_FOLDER = os.path.join(os.getcwd(), 'uploads', 'temp')

    @classmethod
    def save_user_faces(cls, user, image_files):
        """
        Guarda las 20 fotos del usuario con el formato:
        carpeta: nombre_apellido
        imágenes: user{id}_1.jpg, user{id}_2.jpg, ... user{id}_20.jpg
        """
        if not image_files:
            return None

        folder_name = secure_filename(f"{user.name}_{user.lastname}")
        user_folder = os.path.join(cls.BASE_UPLOAD_FOLDER, folder_name)
        os.makedirs(user_folder, exist_ok=True)

        saved_count = 0
        for i, file in enumerate(image_files, start=1):
            if file and file.filename:
                # Asegurar extensión .jpg
                filename = f"user{user.id}_{i}.jpg"  # Siempre .jpg
                file_path = os.path.join(user_folder, filename)
                file.save(file_path)
                saved_count += 1
            
                if saved_count >= 20:
                    break

        print(f"[IA] ✅ {saved_count} fotos guardadas para {folder_name}")
        return user_folder

    @classmethod
    def recognize_face(cls, image_file):
        """
        Recibe una imagen, la compara con la DB de rostros y retorna el user_id si coincide.
        """
        os.makedirs(cls.TEMP_FOLDER, exist_ok=True)
        
        # Guardar imagen temporal
        temp_filename = f"temp_{uuid.uuid4().hex[:8]}.jpg"
        temp_path = os.path.join(cls.TEMP_FOLDER, temp_filename)
        image_file.save(temp_path)

        try:
            print(f"[IA] 🔍 Analizando imagen: {temp_filename}")
            
            # Verificar que hay imágenes en la base de datos
            if not os.path.exists(cls.BASE_UPLOAD_FOLDER) or not os.listdir(cls.BASE_UPLOAD_FOLDER):
                print("[IA] ⚠️ No hay imágenes en la base de datos")
                return None

            # Intentar reconocimiento con opencv (el más compatible)
            print("[IA] Ejecutando DeepFace.find...")
            dfs = DeepFace.find(
                img_path=temp_path,
                db_path=cls.BASE_UPLOAD_FOLDER,
                model_name="VGG-Face",
                detector_backend="opencv",
                enforce_detection=False,
                silent=True
            )

            if not dfs or dfs[0].empty:
                print("[IA] ❌ No se encontró coincidencia")
                return None

            # Obtener la ruta de la imagen coincidente
            matched_path = dfs[0].iloc[0]['identity']
            # Extraer el nombre de la carpeta (nombre_apellido)
            folder_name = os.path.basename(os.path.dirname(matched_path))
            
            print(f"[IA] ✅ Coincidencia encontrada: {folder_name}")
            print(f"👤 [FACIAL] Usuario reconocido: {folder_name}")
            return folder_name

        except Exception as e:
            print(f"[IA] ❌ Error en reconocimiento:")
            traceback.print_exc()
            return None
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)

    @classmethod
    def preload_model(cls):
        """Precarga el modelo de IA para evitar timeouts en la primera petición"""
        print("[IA] Precargando modelo DeepFace (puede tardar 1-2 minutos)...")
        
        os.makedirs(cls.BASE_UPLOAD_FOLDER, exist_ok=True)
        
        # Buscar una imagen de prueba
        for root, dirs, files in os.walk(cls.BASE_UPLOAD_FOLDER):
            for file in files:
                if file.lower().endswith(('.jpg', '.png', '.jpeg')):
                    sample_img = os.path.join(root, file)
                    try:
                        DeepFace.find(
                            img_path=sample_img,
                            db_path=cls.BASE_UPLOAD_FOLDER,
                            model_name="VGG-Face",
                            detector_backend="opencv",
                            silent=True,
                            enforce_detection=False
                        )
                        print("[IA] ✅ Modelo cargado exitosamente")
                        return
                    except Exception as e:
                        print(f"[IA] ⚠️ Error al precargar (no crítico): {str(e)[:100]}")
                    return
        
        print("[IA] ℹ️ No se encontraron imágenes para precargar")

        ext = os.path.splitext(file.filename)[1].lower()