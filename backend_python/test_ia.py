"""Script para probar el reconocimiento facial sin levantar el servidor"""
from app.services.face_recognition_service import FaceRecognitionService
import os

# 1. Verificar carpetas
print("=" * 50)
print("📁 VERIFICANDO ESTRUCTURA DE CARPETAS")
print("=" * 50)
print(f"Carpeta de rostros: {FaceRecognitionService.BASE_UPLOAD_FOLDER}")
print(f"Existe: {os.path.exists(FaceRecognitionService.BASE_UPLOAD_FOLDER)}")
print(f"Carpeta temporal: {FaceRecognitionService.TEMP_FOLDER}")
print(f"Existe: {os.path.exists(FaceRecognitionService.TEMP_FOLDER)}")

# 2. Contar imágenes por usuario
print("\n" + "=" * 50)
print("👥 USUARIOS REGISTRADOS")
print("=" * 50)

if os.path.exists(FaceRecognitionService.BASE_UPLOAD_FOLDER):
    for folder in os.listdir(FaceRecognitionService.BASE_UPLOAD_FOLDER):
        folder_path = os.path.join(FaceRecognitionService.BASE_UPLOAD_FOLDER, folder)
        if os.path.isdir(folder_path):
            files = [f for f in os.listdir(folder_path) if f.endswith(('.jpg', '.png'))]
            print(f"\n📂 {folder}")
            print(f"   Total imágenes: {len(files)}")
            if files:
                print(f"   Ejemplos: {', '.join(files[:5])}")
else:
    print("⚠️ No hay carpeta de imágenes. Crea usuarios primero.")

print("\n" + "=" * 50)
print("✅ Verificación completada")
print("=" * 50)