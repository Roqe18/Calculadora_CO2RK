import pandas as pd
import os

data = [
    {"ID": "ARB_001", "Especie": "Quercus suber", "DBH": 18.5, "Altura": 6.2},
    {"ID": "ARB_002", "Especie": "Quercus suber", "DBH": 22.0, "Altura": 6.8},
    {"ID": "ARB_003", "Especie": "Pinus pinea", "DBH": 19.2, "Altura": 7.1},
    {"ID": "ARB_004", "Especie": "Quercus suber", "DBH": 15.4, "Altura": 5.8},
    {"ID": "ARB_005", "Especie": "Quercus ilex", "DBH": 20.1, "Altura": 6.0},
    {"ID": "ARB_006", "Especie": "Quercus suber", "DBH": 24.3, "Altura": 7.4},
    {"ID": "ARB_007", "Especie": "Quercus faginea", "DBH": 17.2, "Altura": 5.9},
    {"ID": "ARB_008", "Especie": "Quercus suber", "DBH": 16.8, "Altura": 6.1},
    {"ID": "ARB_009", "Especie": "Ceratonia siliqua", "DBH": 18.0, "Altura": 5.5},
    {"ID": "ARB_010", "Especie": "Quercus suber", "DBH": 21.5, "Altura": 6.7},
    {"ID": "ARB_011", "Especie": "Quercus suber", "DBH": 19.8, "Altura": 6.3},
    {"ID": "ARB_012", "Especie": "Pinus pinea", "DBH": 23.1, "Altura": 7.8},
    {"ID": "ARB_013", "Especie": "Quercus suber", "DBH": 14.9, "Altura": 5.4},
    {"ID": "ARB_014", "Especie": "Quercus ilex", "DBH": 18.7, "Altura": 5.9},
    {"ID": "ARB_015", "Especie": "Quercus suber", "DBH": 25.6, "Altura": 7.5}
]

df = pd.DataFrame(data)
os.makedirs("data/templates", exist_ok=True)
excel_path = "data/templates/plantilla_inventario_rodales.xlsx"

with pd.ExcelWriter(excel_path, engine="xlsxwriter") as writer:
    df.to_excel(writer, sheet_name="Inventario_Arbol_a_Arbol", index=False)

print(f"Template successfully generated at {excel_path}")
