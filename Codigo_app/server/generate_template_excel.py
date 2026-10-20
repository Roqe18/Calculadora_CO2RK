import pandas as pd
import os

def create_excel_template():
    data = [
        {"ID": "R01", "Nombre": "Rodal Pinares Norte", "Especie": "Pinus sylvestris", "Superficie_ha": 14.5, "Edad": 50, "Volumen_m3_ha": 165.0, "Area_Basimetrica_m2_ha": 22.4, "Crecimiento_IMA": 5.2, "Tratamiento": "monte_alto"},
        {"ID": "R02", "Nombre": "Rodal Ladera Sur", "Especie": "Pinus pinaster", "Superficie_ha": 22.0, "Edad": 38, "Volumen_m3_ha": 130.0, "Area_Basimetrica_m2_ha": 18.0, "Crecimiento_IMA": 6.0, "Tratamiento": "monte_alto"},
        {"ID": "R03", "Nombre": "Encinar Dehesa Baja", "Especie": "Quercus ilex", "Superficie_ha": 35.0, "Edad": 75, "Volumen_m3_ha": 85.0, "Area_Basimetrica_m2_ha": 14.5, "Crecimiento_IMA": 1.8, "Tratamiento": "monte_alto"},
        {"ID": "R04", "Nombre": "Hayedo Umbría Alta", "Especie": "Fagus sylvatica", "Superficie_ha": 18.2, "Edad": 65, "Volumen_m3_ha": 210.0, "Area_Basimetrica_m2_ha": 26.0, "Crecimiento_IMA": 5.0, "Tratamiento": "monte_alto"},
        {"ID": "R05", "Nombre": "Castañar Vega", "Especie": "Castanea sativa", "Superficie_ha": 8.4, "Edad": 22, "Volumen_m3_ha": 110.0, "Area_Basimetrica_m2_ha": 16.0, "Crecimiento_IMA": 7.5, "Tratamiento": "monte_bajo"}
    ]

    df = pd.DataFrame(data)
    
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "templates", "plantilla_inventario_rodales.xlsx")
    
    with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
        df.to_excel(writer, sheet_name="Inventario_Rodales", index=False)
        workbook = writer.book
        worksheet = writer.sheets["Inventario_Rodales"]
        
        # Formatos
        header_format = workbook.add_format({
            "bold": True,
            "text_wrap": True,
            "valign": "top",
            "fg_color": "#10B981",
            "font_color": "#FFFFFF",
            "border": 1
        })
        
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_format)
            worksheet.set_column(col_num, col_num, 18)
            
    print(f"Plantilla Excel creada exitosamente en: {output_path}")

if __name__ == "__main__":
    create_excel_template()
