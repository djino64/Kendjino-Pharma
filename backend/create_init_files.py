import os

apps = [
    "users", "produits", "ventes", "stock",
    "clients", "fournisseurs", "achats",
    "ordonnances", "rapports"
]

base = "."

os.makedirs(os.path.join(base, "apps"), exist_ok=True)

for app in apps:
    path = os.path.join(base, "apps", app)
    os.makedirs(path, exist_ok=True)
    open(os.path.join(path, "__init__.py"), "w").close()

open(os.path.join(base, "apps", "__init__.py"), "w").close()

os.makedirs(os.path.join(base, "config", "settings"), exist_ok=True)
open(os.path.join(base, "config", "__init__.py"), "w").close()
open(os.path.join(base, "config", "settings", "__init__.py"), "w").close()

os.makedirs(os.path.join(base, "common", "utils"), exist_ok=True)
os.makedirs(os.path.join(base, "common", "permissions"), exist_ok=True)
open(os.path.join(base, "common", "__init__.py"), "w").close()

print("✅ Tous les fichiers __init__.py ont été créés !")