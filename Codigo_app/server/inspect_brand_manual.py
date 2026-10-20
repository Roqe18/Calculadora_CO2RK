import fitz  # PyMuPDF
import os
import json

pdf_path = r"Manual_identidad_IDAF\ManualIdentidad-IDAF.pdf"
output_dir = r"Manual_identidad_IDAF"

doc = fitz.open(pdf_path)
print(f"Total paginas: {len(doc)}")

full_text = []
for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    if text.strip():
        full_text.append(f"--- PAGINA {page_num + 1} ---\n{text}")

text_content = "\n".join(full_text)
with open(os.path.join(output_dir, "manual_texto_extraido.txt"), "w", encoding="utf-8") as f:
    f.write(text_content)

print(f"Texto extraido guardado en manual_texto_extraido.txt ({len(text_content)} caracteres)")

# Extraer imagenes (logos)
images_saved = 0
for page_num in range(len(doc)):
    page = doc[page_num]
    image_list = page.get_images(full=True)
    for img_index, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        
        # Guardar imagenes de tamano relevante (> 5KB)
        if len(image_bytes) > 5000:
            img_filename = f"img_p{page_num+1}_{img_index+1}.{image_ext}"
            img_filepath = os.path.join(output_dir, img_filename)
            with open(img_filepath, "wb") as f_img:
                f_img.write(image_bytes)
            images_saved += 1

print(f"Total imagenes extraidas: {images_saved}")
